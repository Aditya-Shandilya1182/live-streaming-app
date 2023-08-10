"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(express_1.default.static('public'));
const socket = (0, socket_io_client_1.default)();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startButton = document.getElementById('startButton');
const joinButton = document.getElementById('joinButton');
let localStream = null;
let peerConnection = null;
startButton.addEventListener('click', startStreaming);
joinButton.addEventListener('click', joinStreaming);
function startStreaming() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            localStream = yield navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localVideo.srcObject = localStream;
            startButton.disabled = true;
            joinButton.disabled = false;
        }
        catch (error) {
            console.log('Error:', error);
        }
    });
}
;
function joinStreaming() {
    socket.emit('join-room', 'room1');
    // Create peer connection
    peerConnection = new RTCPeerConnection();
    // Add local stream to the peer connection
    if (localStream) {
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
    }
    socket.on('offer', (data) => __awaiter(this, void 0, void 0, function* () {
        peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = yield peerConnection.createAnswer();
        peerConnection.setLocalDescription(answer);
        socket.emit('answer', { userId: data.userId, answer });
    }));
    socket.on('ice-candidate', (data) => {
        if (data.candidate) {
            peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
    });
    // Handle remote stream
    peerConnection.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
            remoteVideo.srcObject = event.streams[0];
        }
    };
}
;
