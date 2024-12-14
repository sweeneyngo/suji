import React, { useState, useEffect } from 'react';
import './Notification.css';

interface NotificationProps {
    message: string;
    duration: number;
}

const Notification: React.FC<NotificationProps> = ({ message, duration }) => {
    const [visible, setVisible] = useState(true);
    const [inTransition, setInTransition] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setInTransition(true);
            setTimeout(() => {
                setVisible(false);
            }, 500);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    if (!visible) return null;

    return (
        <div className={`notification ${inTransition ? 'slide-out' : 'slide-in'}`}>
            {message}
        </div>
    );
};

export default Notification;
