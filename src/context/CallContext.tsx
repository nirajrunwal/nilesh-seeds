'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User } from '@/lib/mockData';

type CallType = 'video' | 'voice';
type CallStatus = 'idle' | 'calling' | 'ringing' | 'in-call' | 'ended';

interface CallState {
    status: CallStatus;
    callType: CallType | null;
    caller: User | null;
    callee: User | null;
    peerId: string | null;
}

interface CallContextType {
    callState: CallState;
    initiatecall: (callee: User, type: CallType) => void;
    answerCall: () => void;
    rejectCall: () => void;
    endCall: () => void;
    peer: any | null;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export function CallProvider({ children }: { children: React.ReactNode }) {
    const [callState, setCallState] = useState<CallState>({
        status: 'idle',
        callType: null,
        caller: null,
        callee: null,
        peerId: null
    });

    const peerInstance = useRef<any>(null);

    const initiatecall = (callee: User, type: CallType) => {
        setCallState({
            status: 'calling',
            callType: type,
            caller: null, // Current user (will be set by component)
            callee,
            peerId: callee.id
        });
    };

    const answerCall = () => {
        setCallState(prev => ({ ...prev, status: 'in-call' }));
    };

    const rejectCall = () => {
        setCallState({
            status: 'ended',
            callType: null,
            caller: null,
            callee: null,
            peerId: null
        });

        // Reset to idle after animation
        setTimeout(() => {
            setCallState({
                status: 'idle',
                callType: null,
                caller: null,
                callee: null,
                peerId: null
            });
        }, 1000);
    };

    const endCall = () => {
        if (peerInstance.current) {
            peerInstance.current.destroy();
            peerInstance.current = null;
        }

        setCallState({
            status: 'ended',
            callType: null,
            caller: null,
            callee: null,
            peerId: null
        });

        setTimeout(() => {
            setCallState({
                status: 'idle',
                callType: null,
                caller: null,
                callee: null,
                peerId: null
            });
        }, 1000);
    };

    return (
        <CallContext.Provider value={{
            callState,
            initiatecall,
            answerCall,
            rejectCall,
            endCall,
            peer: peerInstance.current
        }}>
            {children}
        </CallContext.Provider>
    );
}

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) throw new Error('useCall must be used within CallProvider');
    return context;
};
