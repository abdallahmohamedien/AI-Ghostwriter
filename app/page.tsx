"use client";
import { useState } from "react";

export default function GhostwriterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState("Professional");
  const [copied, setCopied] = useState(false);

  const generateContent = async (platform: "LinkedIn" | "Twitter") => {
    if (!input) return alert("اكتب فكرتك الأول يا هندسة");

    setIsLoading(true);
    setCopied(false);
    setOutput(`جاري كتابة بوست ${platform} بنبرة ${tone}...`);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

      const systemPrompt = `أنت خبير محتوى رقمي. المطلوب كتابة بوست لـ ${platform}. 
      نبرة الصوت يجب أن تكون: ${tone}. 
      اللغة: العربية. 
      التنسيق: جذاب مع ايموجي وهاشتاجات مناسبة.`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `حول هذه الفكرة لبوست: ${input}` }
          ],
          model: "llama-3.3-70b-versatile"
        })
      });

      const data = await response.json();
      if (data.choices?.[0]) {
        setOutput(data.choices[0].message.content);
      }
    } catch (error) {
      setOutput("حصلت مشكلة في الربط، جرب تاني.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // يرجع لحالته الأصلية بعد ثانيتين
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-12 text-right" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-indigo-600">
            AI Ghostwriter Pro ✍️
          </h1>
          <p className="text-slate-500 mt-3 text-lg font-medium">حول أفكارك لمحتوى يخطف الأنظار</p>
        </header>

        {/* Input Card */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-white mb-8 transition-all hover:shadow-2xl">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-2">اختر نبرة الصوت:</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none text-black transition-all appearance-none cursor-pointer"
              >
                <option value="Professional">مهني وجاد 💼</option>
                <option value="Storytelling">حكاية وقصة 📖</option>
                <option value="Funny">ساخر وفكاهي 😂</option>
                <option value="Educational">تعليمي ودسم 🎓</option>
                <option value="Short & Bold">قصير وجريء 🔥</option>
              </select>
            </div>
          </div>

          <textarea
            className="w-full h-44 p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none text-black text-lg transition-all placeholder:text-slate-400"
            placeholder="اكتب فكرتك الخام هنا.. (مثلاً: نصيحة للمبرمجين المبتدئين)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <button
              disabled={isLoading}
              onClick={() => generateContent("LinkedIn")}
              className="bg-[#0077b5] text-white font-bold py-4 rounded-2xl hover:bg-[#005582] active:scale-95 disabled:bg-slate-300 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              LinkedIn Post
            </button>
            <button
              disabled={isLoading}
              onClick={() => generateContent("Twitter")}
              className="bg-black text-white font-bold py-4 rounded-2xl hover:bg-slate-800 active:scale-95 disabled:bg-slate-300 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              X (Twitter) Post
            </button>
          </div>
        </div>

        {/* Output Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-slate-900 text-slate-100 p-8 rounded-3xl shadow-2xl min-h-[250px]">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <span className="text-blue-400 font-mono text-sm tracking-tighter">GENERATED_CONTENT</span>
              <button
                onClick={handleCopy}
                disabled={!output || isLoading}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${copied ? "bg-green-500 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  }`}
              >
                {copied ? "تم النسخ! ✓" : "نسخ المحتوى 📋"}
              </button>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed text-lg font-light">
              {output || "اكتب فكرتك واختار المنصة لتبدأ السحر..."}
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-slate-400 text-xs tracking-widest uppercase">
          Build by AbdalluhMo  for Developers • 2026
        </footer>
      </div>
    </main>
  );
}