document.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.getElementById('chat-box');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const micBtn = document.getElementById('mic-btn');
  const langSelect = document.getElementById('language-select');
  const darkModeToggle = document.getElementById('dark-mode-toggle');

  let isRecording = false;
  let recognition;
  let selectedLang = 'en-US';

  langSelect.addEventListener('change', () => {
    const lang = langSelect.value;
    if (lang === 'hindi') selectedLang = 'hi-IN';
    else if (lang === 'urdu') selectedLang = 'ur-PK';
    else selectedLang = 'en-US';
  });

  function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add(sender === 'User' ? 'user-message' : 'ai-message');

    if (sender === 'Jarvis') {
      msgDiv.innerHTML = `
        <div>${sender}: ${text}</div>
        <button class="speak-btn">🔊 Speak</button>
      `;
    } else {
      msgDiv.textContent = `${sender}: ${text}`;
    }

    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    if (sender === 'Jarvis') {
      const speakBtn = msgDiv.querySelector('.speak-btn');
      speakBtn.addEventListener('click', () => {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = selectedLang;
        speechSynthesis.cancel();
        speechSynthesis.speak(utter);
      });
    }
  }

  async function sendMessage(text, audioBlob = null) {
    if (!text && !audioBlob) return;

    appendMessage('User', text);
    userInput.value = '';

    const formData = new FormData();
    if (audioBlob) {
      formData.append('audio', audioBlob, 'audio.wav');
    } else {
      formData.append('text', text);
    }

    formData.append('lang', selectedLang);

    try {
      const response = await fetch('/Jarvis', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      const aiResponse = data.response;
      appendMessage('Jarvis', aiResponse);

    } catch (error) {
      appendMessage('Jarvis', 'Error connecting to server.');
      console.error(error);
    }
  }

  sendBtn.addEventListener('click', () => {
    const text = userInput.value.trim();
    sendMessage(text);
  });

  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const text = userInput.value.trim();
      sendMessage(text);
    }
  });

  micBtn.addEventListener('click', () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech Recognition not supported.');
      return;
    }

    if (!isRecording) {
      recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = selectedLang;

      let finalTranscript = '';
      micBtn.textContent = '🛑 Stop';

      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
      };

      recognition.onend = () => {
        micBtn.textContent = '🎤';
        userInput.value = finalTranscript.trim();
        sendMessage(finalTranscript.trim());
        isRecording = false;
      };

      recognition.start();
      isRecording = true;
    } else {
      recognition.stop();
      micBtn.textContent = '🎤';
    }
  });

  // Dark Mode Toggle Handler
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    darkModeToggle.classList.toggle('active');

    // Optional: Store dark mode state in localStorage
    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  });

  // On load: Apply dark mode if previously selected
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    darkModeToggle.classList.add('active');
  }
});
