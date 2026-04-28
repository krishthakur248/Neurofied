import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatbotWidget from './ChatbotWidget';
import { useAuth } from '../App';

export default function FloatingChatButton() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      {/* Floating Button - Bottom Right Corner */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 w-16 h-16 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-40 group border border-primary/50"
      >
        {/* Pulsing background ring */}
        <div className="absolute inset-0 rounded-full bg-primary/20 group-hover:bg-primary/30 transition animate-pulse" />

        {/* Icon */}
        {isOpen ? (
          <X className="w-6 h-6 text-white relative z-10 transition-transform duration-300 rotate-90" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white relative z-10 transition-transform duration-300" />
        )}

        {/* Badge for unread (optional) */}
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary rounded-full text-white text-xs font-bold flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition">
          AI
        </span>
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-44 md:bottom-28 right-4 md:right-8 w-[calc(100%-2rem)] md:w-full max-w-md h-[500px] max-h-[80vh] shadow-2xl rounded-2xl z-50 animate-fade-in-up overflow-hidden bg-surface-container-lowest flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 p-5 flex items-center justify-between border-b border-primary/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
                <img src="/images/LOGO.jpeg" alt="Neurofied Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Neurofied AI</h2>
                <p className="text-white/70 text-xs">Your cognitive health advisor</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Widget */}
          <div className="flex-1 min-h-0 h-full">
            <ChatbotWidget userId={user?.id} />
          </div>
        </div>
      )}

      {/* Semi-transparent Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
