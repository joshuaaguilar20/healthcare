


import "@babel/polyfill";
import * as mobilenetModule from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

// Number of classes to classify
const NUM_CLASSES = 3;
// Webcam Image size. Must be 227. 
const IMAGE_SIZE = 227;
// K value for KNN
const TOPK = 3;
var globalRef = {};
var callcount = 0;
var changeflag = false;
var callcount1 = 0;
var changeflag1 = false;
var callcount2 = 0;
var changeflag2 = false;
class Main {
  constructor() {
    // Initiate variables
    this.infoTexts = [];
    this.training = -1; // -1 when no class is being trained
    this.videoPlaying = false;


    // Initiate deeplearn.js math and knn classifier objects
    this.bindPage();

    // Create video element that will contain the webcam image


    // Add video element to DOM
    this.video = document.getElementById('video')
    this.video.setAttribute('autoplay', '');
    this.video.setAttribute('playsinline', '');


    // Create training buttons and info texts    
    for (let i = 0; i < NUM_CLASSES; i++) {
      const div = document.getElementById('testbutton');
      div.style.marginBottom = '10px';

      // Create training button
      const button = document.createElement('button')
      button.innerText = "Train " + i;
      div.appendChild(button);

      // Listen for mouse events when clicking the button
      button.addEventListener('mousedown', () => this.training = i);
      button.addEventListener('mouseup', () => this.training = -1);

      // Create info text
      const infoText = document.createElement('span')
      infoText.setAttribute('class', 'infoText')
      infoText.innerText = " No examples added";
      div.appendChild(infoText);
      this.infoTexts.push(infoText);
    }


    // Setup webcam
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        this.video.srcObject = stream;
        this.video.width = IMAGE_SIZE;
        this.video.height = IMAGE_SIZE;

        this.video.addEventListener('playing', () => this.videoPlaying = true);
        this.video.addEventListener('paused', () => this.videoPlaying = false);
      })
  }

  //Bind Page
  async bindPage() {
    this.knn = knnClassifier.create();
    this.mobilenet = await mobilenetModule.load();

    this.start();
  }

  start() {
    if (this.timer) {
      this.stop();
    }
    this.video.play();
    this.timer = requestAnimationFrame(this.animate.bind(this));
  }

  stop() {
    this.video.pause();
    cancelAnimationFrame(this.timer);
  }

  async animate() {
    if (this.videoPlaying) {
      // Get image data from video element
      const image = tf.fromPixels(this.video);

      let logits;
      // 'conv_preds' is the logits activation of MobileNet.
      const infer = () => this.mobilenet.infer(image, 'conv_preds');

      // Train class if one of the buttons is held down
      if (this.training != -1) {
        logits = infer();

        // Add current image to classifier
        this.knn.addExample(logits, this.training)
      }

      const numClasses = this.knn.getNumClasses();
      if (numClasses > 0) {

        // If classes have been added run predict
        logits = infer();
        const res = await this.knn.predictClass(logits, TOPK);
        for (let i = 0; i < NUM_CLASSES; i++) {

          // The number of examples for each class
          const exampleCount = this.knn.getClassExampleCount();

          // Make the predicted class bold
          if (res.classIndex == i) {
            this.infoTexts[i].style.fontWeight = 'bold';

          } else {
            this.infoTexts[i].style.fontWeight = 'normal';
          }

          // Update info text
          if (exampleCount[i] > 0) {
            globalRef[i] = res.confidences[i] * 100


            this.infoTexts[i].innerText = ` ${exampleCount[i]} examples - ${res.confidences[i] * 100}%`
          }
        }
      }

      (function () {
        function speak(text) {
          // Create a new instance of SpeechSynthesisUtterance.
          var msg = new SpeechSynthesisUtterance();


          msg.text = text;


          window.speechSynthesis.speak(msg);
        }

        function one() {
          speak('Assessment Completed')
          changeflag = true;
          callcount++
          changeflag1 = false;
          callcount1 = 0
          changeflag2 = false;
          callcount2 = 0

        }
        function two() {
          speak('Medication Administered');
          changeflag1 = true;
          callcount1++
          changeflag = false;
          callcount = 0
          changeflag2 = false;
          callcount2 = 0
        };

        function three() {
          speak('Advanced Cardiac Life Support Started');
          changeflag2 = true;
          callcount2++
          callcount = 0
          changeflag = false
          callcount1 = 0
          changeflag1 = false
        }

        globalRef[0] > 90 && changeflag == false && callcount == 0 ? one() : globalRef[1] > 90 && changeflag1 == false && callcount1 == 0 ?
          two() : globalRef[2] > 90 && changeflag2 == false && callcount2 == 0 ? three() : null

      })()



      // Dispose image when done
      image.dispose();
      if (logits != null) {
        logits.dispose();
      }
    }
    this.timer = requestAnimationFrame(this.animate.bind(this));
  }
}

window.addEventListener('load', () => new Main());




