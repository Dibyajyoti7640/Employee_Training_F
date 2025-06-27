// import React, { useState } from "react";
// import api from "../services/api";

// const AdolfKitlerBot = () => {
//     const [messages, setMessages] = useState([
//         { sender: "assistant", text: "Hi! I am Adolf Kitler.\nHow can I help you today?" }
//     ]);
//     const [input, setInput] = useState("");
//     const [loading, setLoading] = useState(false);

//     const handleSend = async () => {
//         if (!input.trim()) return;

//         const userMessage = { sender: "user", text: input };
//         setMessages(prev => [...prev, userMessage]);
//         setInput("");
//         setLoading(true);

//         try {
//             const response = await api.post("/AdolfKitler/ask", {
//                 message: input
//             });

//             const resData = response.data;
//             const parsed = typeof resData === "string" ? JSON.parse(resData) : resData;

//             const reply = parsed.choices?.[0]?.message?.content || "No response.";
//             setMessages(prev => [...prev, { sender: "assistant", text: reply }]);
//         } catch (err) {
//             console.error(err);
//             setMessages(prev => [...prev, { sender: "assistant", text: "Sorry, there was an error." }]);
//         }

//         setLoading(false);
//     };

//     return (
//         <div className="max-w-xl mx-auto p-4 border rounded shadow bg-white h-[90vh] flex flex-col">
//             <div className="flex-1 overflow-y-auto space-y-2">
//                 {messages.map((msg, i) => (
//                     <div
//                         key={i}
//                         className={`p-2 rounded-md max-w-[80%] whitespace-pre-line ${msg.sender === "user" ? "ml-auto bg-blue-100" : "mr-auto bg-gray-100"
//                             }`}
//                     >
//                         {msg.text}
//                     </div>
//                 ))}
//                 {loading && <div className="mr-auto text-gray-500">Typing...</div>}
//             </div>

//             <div className="flex mt-4">
//                 <input
//                     type="text"
//                     value={input}
//                     onChange={e => setInput(e.target.value)}
//                     onKeyDown={e => e.key === "Enter" && handleSend()}
//                     placeholder="Type your question..."
//                     className="flex-1 p-2 border rounded-l"
//                 />
//                 <button
//                     onClick={handleSend}
//                     className="bg-blue-500 text-white px-4 rounded-r"
//                 >
//                     Send
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default AdolfKitlerBot;


import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import api from "../services/api";

const AdolfKitlerBot = () => {
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
        <div className="max-w-xl mx-auto p-4 border rounded shadow bg-white h-[90vh] flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`p-3 rounded-md max-w-[80%] whitespace-pre-wrap text-sm leading-relaxed ${msg.sender === "user"
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

            <div className="flex mt-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type your question..."
                    className="flex-1 p-2 border rounded-l focus:outline-none focus:ring focus:border-blue-300"
                />
                <button
                    onClick={handleSend}
                    className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default AdolfKitlerBot;
