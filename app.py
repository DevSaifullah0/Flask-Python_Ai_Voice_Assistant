from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from modules.voice import speech_to_text
from modules.Ai_core import get_ai_response
import os
import tempfile
from models import db, UserMessage

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chatdata.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('Jarvis.html')

@app.route('/Jarvis', methods=['POST'])
def chat():
    user_input = request.form.get('text', '')
    bcp_language = request.form.get('language', 'en-US')
    response_text = ""

    # ✅ Extract base language code like "en", "hi", "ur"
    language_code = bcp_language.split('-')[0]

    if 'audio' in request.files:
        audio_file = request.files['audio']
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
            audio_file.save(temp_audio.name)
            user_input = speech_to_text(temp_audio.name, language=bcp_language)
            os.unlink(temp_audio.name)

    if user_input:
        # ✅ Send user input and language code to AI
        response_text = get_ai_response(user_input, language_code)

        msg = UserMessage(user_input=user_input, ai_response=response_text)
        db.session.add(msg)
        db.session.commit()

    return jsonify({"response": response_text})

if __name__ == '__main__':
    app.run(debug=True)
