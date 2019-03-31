class TextToSpeech {
    constructor() {
        this.voices = [];
        this.voice = null;
        this.message = null;
        if (typeof speechSynthesis === 'object' && typeof speechSynthesis.onvoiceschanged === 'function') {
            speechSynthesis.onvoiceschanged = this.setVoice;
        }

    }

    setVoice() {
        this.voices = window.speechSynthesis.getVoices();
        this.voice = this.voices.filter(function (voice) {
            return voice.name === 'Google US English Female';
        })[0];
    }

    stop() {
        window.speechSynthesis.cancel();
    }

    say(text, callback) {
        this.message = new SpeechSynthesisUtterance();
        this.message.text = text;
        this.message.voice = this.voice;
        this.message.rate = 0.9;
        this.message.lang = 'en-US';
        this.message.addEventListener('end', callback);
        window.speechSynthesis.speak(this.message);
    }
}

export default TextToSpeech;