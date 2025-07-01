import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import api from "../services/api";
import { MessageCircle } from "lucide-react";
const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text: "Hi! I am Adolf Kitler.\nHow can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/AdolfKitler/ask", {
        message: input,
      });

      const resData = response.data;
      const parsed =
        typeof resData === "string" ? JSON.parse(resData) : resData;

      const reply = parsed.choices?.[0]?.message?.content || "No response.";
      setMessages((prev) => [...prev, { sender: "assistant", text: reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "assistant", text: "Sorry, there was an error." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-md max-w-[80%] whitespace-pre-wrap text-sm leading-relaxed ${
              msg.sender === "user"
                ? "ml-auto bg-blue-100"
                : "mr-auto bg-gray-100"
            }`}
          >
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
        ))}
        {loading && (
          <div className="mr-auto text-gray-500 text-sm italic">Typing...</div>
        )}
      </div>

      <div className="flex mt-20    ">
        <div className="p-4 border-t border-gray-100 bg-white/80 backdrop-blur-sm rounded-b-2xl">
          <div className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            />
            <button
              onClick={handleSend}
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <MessageCircle size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
