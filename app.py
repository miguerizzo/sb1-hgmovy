from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import gensim
from gensim import corpora, models
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import nltk
import spacy
import boto3
import pyLDAvis
import pyLDAvis.gensim_models
import re
from collections import defaultdict
import matplotlib.pyplot as plt
from wordcloud import WordCloud
import pandas as pd
from sklearn.manifold import TSNE
import seaborn as sns
import io
import base64
import os

app = Flask(__name__)
CORS(app)

# Download NLTK data
nltk.download('punkt')
nltk.download('stopwords')

# Configure AWS credentials and region
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('user_logs_prod')

def fetch_documents():
    documents = []
    last_evaluated_key = None
    while True:
        if last_evaluated_key:
            response = table.scan(ExclusiveStartKey=last_evaluated_key)
        else:
            response = table.scan()
        
        for item in response['Items']:
            documents.append(item['question'])
        
        last_evaluated_key = response.get('LastEvaluatedKey')
        if not last_evaluated_key:
            break
    return documents

def preprocess_documents(documents):
    stop_words = set(stopwords.words('spanish'))
    custom_stop_words = {
        "hola", "cuales", "a", "b", "c", "d", "dos", "hacer", "siguientes",
        "opciones", "puedes", "dame", "puede", "si", "test", "ejemplo", "ejemplos"
    }
    stop_words.update(custom_stop_words)

    texts = []
    for doc in documents:
        tokens = word_tokenize(doc.lower())
        filtered_tokens = [
            word for word in tokens if word.isalpha() and word not in stop_words
        ]
        texts.append(filtered_tokens)
    return texts

def perform_lda(texts):
    dictionary = corpora.Dictionary(texts)
    corpus = [dictionary.doc2bow(text) for text in texts]
    lda_model = models.LdaModel(corpus, num_topics=10, id2word=dictionary, passes=15)
    return lda_model, corpus, dictionary

def generate_visualizations(lda_model, corpus, dictionary, texts):
    # Ensure the static directory exists
    os.makedirs('static', exist_ok=True)

    # Generate pyLDAvis visualization
    lda_display = pyLDAvis.gensim_models.prepare(lda_model, corpus, dictionary)
    pyLDAvis.save_html(lda_display, 'static/lda_visualization.html')

    # Generate word clouds
    for topic_id in range(lda_model.num_topics):
        plt.figure(figsize=(10, 6))
        topic = lda_model.show_topic(topic_id, topn=50)
        topic_words = dict(topic)
        wordcloud = WordCloud(
            background_color='white',
            width=800,
            height=400,
            max_words=50
        ).generate_from_frequencies(topic_words)
        plt.imshow(wordcloud, interpolation='bilinear')
        plt.axis('off')
        plt.title(f'Topic {topic_id}', fontsize=16)
        plt.savefig(f'static/nube_tema_{topic_id}.png', format='png', dpi=300)
        plt.close()

    # Generate topic distribution chart
    doc_topics = []
    for doc in corpus:
        topic_probs = lda_model.get_document_topics(doc, minimum_probability=0)
        doc_topics.append([prob for _, prob in topic_probs])

    df_doc_topics = pd.DataFrame(doc_topics)
    df_doc_topics.columns = [f'Topic {i}' for i in range(lda_model.num_topics)]

    ax = df_doc_topics.plot(kind='bar', stacked=True, figsize=(12, 6), colormap='tab20')
    plt.xlabel('Documents')
    plt.ylabel('Topic Probability')
    plt.title('Topic Distribution in Documents')
    plt.legend(loc='upper right', bbox_to_anchor=(1.15, 1))
    plt.tight_layout()
    plt.savefig('static/distribucion_temas.png', format='png', dpi=300)
    plt.close()

    # Generate t-SNE visualization
    tsne_model = TSNE(n_components=2, random_state=42)
    tsne_values = tsne_model.fit_transform(df_doc_topics)

    df_tsne = pd.DataFrame(tsne_values, columns=['Dim1', 'Dim2'])
    df_tsne['Dominant_Topic'] = df_doc_topics.idxmax(axis=1)

    plt.figure(figsize=(10, 8))
    sns.scatterplot(
        x='Dim1', y='Dim2',
        hue='Dominant_Topic',
        palette='tab10',
        data=df_tsne,
        legend='full',
        alpha=0.7
    )
    plt.title('t-SNE Visualization of Documents')
    plt.xlabel('Dimension 1')
    plt.ylabel('Dimension 2')
    plt.legend(title='Dominant Topic', loc='best')
    plt.savefig('static/tsne_visualization.png', format='png', dpi=300)
    plt.close()

@app.route('/api/topic_modeling', methods=['GET'])
def topic_modeling():
    documents = fetch_documents()
    texts = preprocess_documents(documents)
    lda_model, corpus, dictionary = perform_lda(texts)
    generate_visualizations(lda_model, corpus, dictionary, texts)

    topics = lda_model.print_topics(num_words=5)
    topic_list = [{'id': i, 'keywords': [word for word, _ in lda_model.show_topic(i, topn=5)]} for i in range(len(topics))]

    corpus_topics = [lda_model.get_document_topics(doc, minimum_probability=0) for doc in corpus]
    dominant_topics = []
    for doc_id, doc_topics in enumerate(corpus_topics):
        doc_topics = sorted(doc_topics, key=lambda x: x[1], reverse=True)
        dominant_topic_id, dominant_topic_prob = doc_topics[0]
        dominant_topics.append((doc_id, dominant_topic_id, dominant_topic_prob))

    document_list = [{'id': i, 'text': documents[i], 'topic': int(topic_id)} for i, (_, topic_id, _) in enumerate(dominant_topics[:20])]

    return jsonify({
        'topics': topic_list,
        'documents': document_list,
    })

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True)