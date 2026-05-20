import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send, User, Bot, ExternalLink } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  showWhatsAppButton?: boolean;
}

const BOT_RESPONSES: Record<string, string> = {
  greeting: "Hello! 👋 Welcome to BlueHaven Studios. How can I help you today?",
  services: "We offer:\n• Brand Identity & Logo Design\n• Social Media Management\n• Video Production & Live Streaming\n• Product Photography & 3D Renders\n• Web Development\n\nWhich service interests you?\n\nNeed detailed discussion? Connect with our team on WhatsApp!",
  pricing: "Our pricing varies based on project scope and requirements. For a personalized quote tailored to your needs, please connect with our team on WhatsApp:\n\n📱 +234 806 848 3718\n\nClick below to start chatting!",
  contact: "📞 WhatsApp: +234 806 848 3718\n📧 Email: info@bluehavenstudios.com\n\nFor instant responses, chat with our team on WhatsApp - we're always ready to help!",
  human: "I'd be happy to connect you with our team! 😊\n\nClick the button below to chat directly with a BlueHaven representative on WhatsApp. They'll be able to assist you with any specific questions or requirements.\n\n📱 +234 806 848 3718",
  portfolio: "You can view our amazing portfolio showcasing work for brands like Primax, Wendee's Bakery, FeFes Kitchen, and many more. Scroll up to see our featured projects!\n\nWant to discuss a similar project? Chat with us on WhatsApp!",
  location: "We're a creative digital agency based in Nigeria, serving clients globally. We work remotely and can collaborate with you wherever you are!\n\nReady to start your project? Connect on WhatsApp!",
  turnaround: "Turnaround time depends on the project type:\n• Logo Design: 5-10 days\n• Social Media Content: 3-7 days\n• Video Production: 10-15 days\n• Full Branding: 15-20 days\n• Complex Projects: Up to 20 days\n\n⚠️ All timelines are subject to change depending on client requirements and project scope.\n\nRush projects can be accommodated! Chat with our team on WhatsApp to discuss your specific timeline.",
  default: "I'm here to help! You can ask me about:\n• Our services\n• Pricing\n• Contact information\n• Portfolio\n• Project timelines\n\nOr connect with our team directly on WhatsApp for personalized assistance!",
};

const QUICK_REPLIES = [
  { id: 1, text: "Services", response: "services" },
  { id: 2, text: "Pricing", response: "pricing" },
  { id: 3, text: "Talk to Human", response: "human" },
  { id: 4, text: "Portfolio", response: "portfolio" },
];

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: BOT_RESPONSES.greeting,
      sender: "bot",
      timestamp: new Date(),
      showWhatsAppButton: false,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): { text: string; showWhatsApp: boolean } => {
    const lowerMessage = userMessage.toLowerCase();

    // Check for human interaction requests
    if (
      lowerMessage.includes("human") ||
      lowerMessage.includes("person") ||
      lowerMessage.includes("agent") ||
      lowerMessage.includes("representative") ||
      lowerMessage.includes("speak to someone") ||
      lowerMessage.includes("talk to someone") ||
      lowerMessage.includes("real person") ||
      lowerMessage.includes("customer service") ||
      lowerMessage.includes("support team")
    ) {
      return { text: BOT_RESPONSES.human, showWhatsApp: true };
    }

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      return { text: BOT_RESPONSES.greeting, showWhatsApp: false };
    }
    if (lowerMessage.includes("service") || lowerMessage.includes("what do you do")) {
      return { text: BOT_RESPONSES.services, showWhatsApp: true };
    }
    if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("how much")) {
      return { text: BOT_RESPONSES.pricing, showWhatsApp: true };
    }
    if (lowerMessage.includes("contact") || lowerMessage.includes("reach") || lowerMessage.includes("phone") || lowerMessage.includes("email")) {
      return { text: BOT_RESPONSES.contact, showWhatsApp: true };
    }
    if (lowerMessage.includes("portfolio") || lowerMessage.includes("work") || lowerMessage.includes("project")) {
      return { text: BOT_RESPONSES.portfolio, showWhatsApp: true };
    }
    if (lowerMessage.includes("location") || lowerMessage.includes("where") || lowerMessage.includes("based")) {
      return { text: BOT_RESPONSES.location, showWhatsApp: true };
    }
    if (lowerMessage.includes("time") || lowerMessage.includes("how long") || lowerMessage.includes("turnaround")) {
      return { text: BOT_RESPONSES.turnaround, showWhatsApp: true };
    }

    return { text: BOT_RESPONSES.default, showWhatsApp: true };
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Bot response after delay
    setTimeout(() => {
      const response = getBotResponse(inputValue);
      const botMessage: Message = {
        id: messages.length + 2,
        text: response.text,
        sender: "bot",
        timestamp: new Date(),
        showWhatsAppButton: response.showWhatsApp,
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 800);
  };

  const handleQuickReply = (responseKey: string) => {
    const userMessage: Message = {
      id: messages.length + 1,
      text: QUICK_REPLIES.find((q) => q.response === responseKey)?.text || "",
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const botMessage: Message = {
        id: messages.length + 2,
        text: BOT_RESPONSES[responseKey],
        sender: "bot",
        timestamp: new Date(),
        showWhatsAppButton: true, // All quick replies should show WhatsApp option
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 800);
  };

  const openWhatsApp = () => {
    window.open("https://wa.me/2348068483718?text=I%20would%20love%20to%20make%20enquiries%20about%20your%20service", "_blank");
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl overflow-hidden group"
        style={{
          background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
          boxShadow: "0 0 30px rgba(59,130,246,0.5)",
        }}
        whileHover={{
          scale: 1.1,
          boxShadow: "0 0 40px rgba(59,130,246,0.7)",
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-[90vw] sm:w-96 h-[500px] rounded-2xl border shadow-2xl overflow-hidden flex flex-col"
            style={{
              background: "rgba(20, 20, 20, 0.95)",
              backdropFilter: "blur(20px)",
              borderColor: "rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 0 30px rgba(59,130,246,0.1)",
            }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div
              className="p-4 flex items-center gap-3 border-b"
              style={{
                background: "linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(6,182,212,0.2) 100%)",
                borderColor: "rgba(255, 255, 255, 0.1)",
              }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm">BlueHaven Assistant</h3>
                <p className="text-gray-400 text-xs">Always here to help</p>
              </div>
              <motion.div
                className="w-2 h-2 rounded-full bg-green-400"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`flex gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {message.sender === "bot" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] ${
                      message.sender === "user"
                        ? ""
                        : "space-y-2"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl ${
                        message.sender === "user"
                          ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-br-none"
                          : "bg-white/10 text-gray-200 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                    </div>
                    {message.sender === "bot" && message.showWhatsAppButton && (
                      <motion.button
                        onClick={openWhatsApp}
                        className="w-full px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all"
                        style={{
                          background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                          color: "#fff",
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <MessageCircle className="w-4 h-4" />
                        Chat on WhatsApp
                        <ExternalLink className="w-3 h-3" />
                      </motion.button>
                    )}
                  </div>
                  {message.sender === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2">
                <div className="flex flex-wrap gap-2">
                  {QUICK_REPLIES.map((reply) => (
                    <motion.button
                      key={reply.id}
                      onClick={() => handleQuickReply(reply.response)}
                      className="px-3 py-1.5 rounded-full text-xs border transition-all"
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        borderColor: "rgba(255, 255, 255, 0.2)",
                        color: "#fff",
                      }}
                      whileHover={{
                        background: "rgba(59,130,246,0.3)",
                        borderColor: "rgba(59,130,246,0.5)",
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {reply.text}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div
              className="p-4 border-t"
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                borderColor: "rgba(255, 255, 255, 0.1)",
              }}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 rounded-xl text-sm border outline-none transition-all"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    color: "#fff",
                  }}
                />
                <motion.button
                  onClick={handleSendMessage}
                  className="px-4 py-2 rounded-xl flex items-center justify-center"
                  style={{
                    background: inputValue.trim() ? "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)" : "rgba(255, 255, 255, 0.1)",
                  }}
                  whileHover={inputValue.trim() ? { scale: 1.05 } : {}}
                  whileTap={{ scale: 0.95 }}
                  disabled={!inputValue.trim()}
                >
                  <Send className="w-4 h-4 text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </>
  );
}