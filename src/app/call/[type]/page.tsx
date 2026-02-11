'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff, SwitchCamera } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { NotificationService } from '@/services/notificationService';
import { MockBackend } from '@/lib/mockData';

export default function CallPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const type = params.type as string;
    const targetId = searchParams.get('target');

    const [status, setStatus] = useState('Initializing...');
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const [peer, setPeer] = useState<any>(null);
    const [callInstance, setCallInstance] = useState<any>(null);
    const [targetName, setTargetName] = useState('');

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const isVideo = type === 'video';

    // Get target user name
    useEffect(() => {
        if (targetId) {
            const targetUser = MockBackend.getUsers().find(u => u.id === targetId);
            setTargetName(targetUser?.name || 'User');
        }
    }, [targetId]);

    // Initialize PeerJS
    useEffect(() => {
        if (!user) {
            router.push('/');
            return;
        }

        const initPeer = async () => {
            try {
                const Peer = (await import('peerjs')).default;
                const sanitizedId = user.id.replace(/[^a-zA-Z0-9]/g, '_');

                const peerInstance = new Peer(sanitizedId, {
                    debug: 1
                });

                peerInstance.on('open', (id) => {
                    console.log('Peer connected:', id);
                    setStatus('Getting media access...');

                    navigator.mediaDevices.getUserMedia({
                        video: isVideo ? { facingMode } : false,
                        audio: true
                    }).then(stream => {
                        localStreamRef.current = stream;

                        if (localVideoRef.current && isVideo) {
                            localVideoRef.current.srcObject = stream;
                            localVideoRef.current.muted = true;
                        }

                        if (targetId) {
                            setStatus(`Calling ${targetName}...`);
                            const sanitizedTarget = targetId.replace(/[^a-zA-Z0-9]/g, '_');

                            const call = peerInstance.call(sanitizedTarget, stream);
                            setCallInstance(call);

                            call.on('stream', (remoteStream) => {
                                setStatus('Connected');
                                if (remoteVideoRef.current) {
                                    remoteVideoRef.current.srcObject = remoteStream;
                                }
                            });

                            call.on('close', () => {
                                endCall();
                            });

                            call.on('error', (err) => {
                                console.error('Call error:', err);
                                setStatus('Call failed - User may be offline');
                                setTimeout(() => endCall(), 3000);
                            });
                        } else {
                            setStatus('Waiting for call...');
                        }
                    }).catch(err => {
                        console.error('Media error:', err);
                        setStatus('Camera/Microphone access denied');
                        setTimeout(() => endCall(), 3000);
                    });
                });

                peerInstance.on('call', (call) => {
                    const callerId = call.peer.replace(/_/g, '');
                    const caller = MockBackend.getUsers().find(u => u.id.includes(callerId));
                    const callerName = caller?.name || 'Unknown';

                    setStatus(`Incoming call from ${callerName}...`);
                    setTargetName(callerName);

                    navigator.mediaDevices.getUserMedia({
                        video: isVideo ? { facingMode } : false,
                        audio: true
                    }).then(stream => {
                        localStreamRef.current = stream;

                        if (localVideoRef.current && isVideo) {
                            localVideoRef.current.srcObject = stream;
                            localVideoRef.current.muted = true;
                        }

                        call.answer(stream);
                        setCallInstance(call);
                        setStatus(`Connected with ${callerName}`);

                        call.on('stream', (remoteStream) => {
                            if (remoteVideoRef.current) {
                                remoteVideoRef.current.srcObject = remoteStream;
                            }
                        });

                        call.on('close', () => endCall());
                    }).catch(err => {
                        console.error('Error answering call:', err);
                        call.close();
                    });
                });

                peerInstance.on('error', (err) => {
                    console.error('Peer error:', err);
                    setStatus('Connection error - Please try again');
                    setTimeout(() => endCall(), 3000);
                });

                setPeer(peerInstance);
            } catch (error) {
                console.error('Failed to initialize:', error);
                setStatus('Failed to connect');
                setTimeout(() => endCall(), 3000);
            }
        };

        initPeer();

        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (callInstance) {
                callInstance.close();
            }
            if (peer) {
                peer.destroy();
            }
        };
    }, [user, targetId, isVideo, facingMode]);

    const endCall = () => {
        NotificationService.stopRingtone();

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (callInstance) {
            callInstance.close();
        }
        if (peer) {
            peer.destroy();
        }

        router.back();
    };

    const toggleMic = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setMicOn(audioTrack.enabled);
            }
        }
    };

    const toggleCam = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setCamOn(videoTrack.enabled);
            }
        }
    };

    const switchCamera = async () => {
        const newFacingMode = facingMode === 'user' ? 'environment' : 'user';

        try {
            if (localStreamRef.current) {
                localStreamRef.current.getVideoTracks().forEach(track => track.stop());
            }

            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: newFacingMode },
                audio: true
            });

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = newStream;
            }

            if (callInstance && callInstance.peerConnection) {
                const videoTrack = newStream.getVideoTracks()[0];
                const sender = callInstance.peerConnection.getSenders().find((s: any) =>
                    s.track && s.track.kind === 'video'
                );
                if (sender) {
                    sender.replaceTrack(videoTrack);
                }
            }

            localStreamRef.current = newStream;
            setFacingMode(newFacingMode);
        } catch (error) {
            console.error('Camera switch error:', error);
        }
    };

    return (
        <div className="relative flex h-screen flex-col items-center justify-between bg-gray-900 text-white overflow-hidden">
            {isVideo && (
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                />
            )}

            {!isVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
                    <div className="flex gap-2 h-32 items-end">
                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                            <div
                                key={i}
                                className="w-3 bg-white rounded-full animate-pulse"
                                style={{
                                    height: `${20 + Math.random() * 80}%`,
                                    animationDelay: `${i * 0.1}s`,
                                    animationDuration: `${0.8 + Math.random() * 0.4}s`
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {isVideo && camOn && (
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute top-4 right-4 w-32 h-48 object-cover rounded-xl border-2 border-white/30 shadow-lg z-20"
                />
            )}

            <div className="relative z-10 pt-16 text-center">
                <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gray-700 p-1 border-2 border-white/20">
                    <div className="h-full w-full rounded-full bg-gray-600 flex items-center justify-center text-3xl font-bold">
                        {targetName ? targetName[0].toUpperCase() : 'U'}
                    </div>
                </div>
                <h2 className="text-2xl font-bold">{targetName || 'Connecting...'}</h2>
                <p className="mt-2 text-sm font-medium tracking-wide opacity-80 uppercase">{status}</p>
            </div>

            <div className="relative z-10 mb-12 flex w-full max-w-md justify-evenly rounded-3xl bg-black/40 p-6 backdrop-blur-md">
                <button
                    onClick={toggleMic}
                    className={`rounded-full p-4 transition-colors ${micOn ? 'bg-white/10 hover:bg-white/20' : 'bg-white text-black'}`}
                >
                    {micOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                </button>

                {isVideo && (
                    <>
                        <button
                            onClick={toggleCam}
                            className={`rounded-full p-4 transition-colors ${camOn ? 'bg-white/10 hover:bg-white/20' : 'bg-white text-black'}`}
                        >
                            {camOn ? <VideoIcon className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                        </button>

                        <button
                            onClick={switchCamera}
                            className="rounded-full p-4 bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <SwitchCamera className="h-6 w-6" />
                        </button>
                    </>
                )}

                <button
                    onClick={endCall}
                    className="rounded-full bg-red-600 p-4 hover:bg-red-700 transition-transform active:scale-95"
                >
                    <PhoneOff className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
}
