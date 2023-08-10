import io from 'socket.io-client';
import express from 'express';

const app = express();

app.use(express.static('public'));

const socket = io();
const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
const startButton = document.getElementById('startButton') as HTMLButtonElement;
const joinButton = document.getElementById('joinButton') as HTMLButtonElement;

let localStream: MediaStream | null = null;
let peerConnection: RTCPeerConnection | null = null;

startButton.addEventListener('click', startStreaming);
joinButton.addEventListener('click', joinStreaming);

async function startStreaming(){
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
        startButton.disabled = true;
        joinButton.disabled = false;
    } catch (error) {
        console.log('Error:',error);
    }
};

function joinStreaming(){
    socket.emit('join-room', 'room1');

    // Create peer connection
     peerConnection = new RTCPeerConnection();

    // Add local stream to the peer connection
    if (localStream) {
        localStream.getTracks().forEach(track => {
        peerConnection!.addTrack(track, localStream!);
        });
    }

    socket.on('offer', async (data) => {
        peerConnection!.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection!.createAnswer();
        peerConnection!.setLocalDescription(answer);
        socket.emit('answer', { userId: data.userId, answer });
    });

    socket.on('ice-candidate', (data) => {
        if (data.candidate) {
          peerConnection!.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
    });
    
    // Handle remote stream
    peerConnection!.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          remoteVideo.srcObject = event.streams[0];
        }
    };
};