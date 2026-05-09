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

  // --- دالة الـ Refine الجديدة ---
  const refineContent = async (action: "shorter" | "emojify" | "formal") => {
    if (!output || isLoading) return;

    const previousText = output;
    setIsLoading(true);
    setCopied(false);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

      let refinePrompt = "";
      if (action === "shorter") refinePrompt = "قم باختصار هذا النص بشكل كبير مع الحفاظ على الفكرة الأساسية.";
      if (action === "emojify") refinePrompt = "أضف المزيد من الإيموجي المناسبة والمبدعة لهذا النص لجعله أكثر حيوية.";
      if (action === "formal") refinePrompt = "قم بإعادة صياغة هذا النص ليكون أكثر رسمية واحترافية وبدون مزاح.";

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: refinePrompt },
            { role: "user", content: previousText }
          ],
          model: "llama-3.3-70b-versatile"
        })
      });

      const data = await response.json();
      if (data.choices?.[0]) {
        setOutput(data.choices[0].message.content);
      }
    } catch (error) {
      setOutput(previousText);
      alert("عذراً، حدث خطأ أثناء التعديل.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

            <div className="whitespace-pre-wrap leading-relaxed text-lg font-light mb-6">
              {output || "اكتب فكرتك واختار المنصة لتبدأ السحر..."}
            </div>

            {/* --- أزرار التعديل السريع (Refine Buttons) --- */}
            {output && !isLoading && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800">
                <button
                  onClick={() => refineContent("shorter")}
                  className="bg-slate-800 hover:bg-blue-900 text-xs text-slate-300 px-3 py-2 rounded-full border border-slate-700 transition-all flex items-center gap-1"
                >
                  ✂️ اختصر
                </button>
                <button
                  onClick={() => refineContent("emojify")}
                  className="bg-slate-800 hover:bg-blue-900 text-xs text-slate-300 px-3 py-2 rounded-full border border-slate-700 transition-all flex items-center gap-1"
                >
                  ✨ إيموجي أكثر
                </button>
                <button
                  onClick={() => refineContent("formal")}
                  className="bg-slate-800 hover:bg-blue-900 text-xs text-slate-300 px-3 py-2 rounded-full border border-slate-700 transition-all flex items-center gap-1"
                >
                  👔 خليه رسمي
                </button>
              </div>
            )}
          </div>

          {/* LinkedIn Mockup Preview */}
          <div className="bg-white border border-slate-200 rounded-lg max-w-[550px] mx-auto mt-10 shadow-sm text-right px-4 py-3 mb-10" dir="rtl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full overflow-hidden flex-shrink-0 border flex items-center justify-center text-white font-bold">
                AM
              </div>
              <div>
                <h4 className="text-sm font-bold text-black">Abdallah Mohamedien</h4>
                <p className="text-xs text-slate-500">Junior Front End Developer • 1st</p>
                <p className="text-[10px] text-slate-400">Now • 🌐</p>
              </div>
            </div>

            <div className="text-sm text-slate-800 leading-snug whitespace-pre-wrap mb-4">
              {output || "هنا سيظهر شكل البوست النهائي..."}
            </div>

            <div className="border-t border-slate-100 pt-2 flex justify-around">
              <button className="text-slate-500 text-sm font-bold hover:bg-slate-50 p-2 rounded flex items-center gap-1">👍 أعجبني</button>
              <button className="text-slate-500 text-sm font-bold hover:bg-slate-50 p-2 rounded flex items-center gap-1">💬 تعليق</button>
              <button className="text-slate-500 text-sm font-bold hover:bg-slate-50 p-2 rounded flex items-center gap-1">🔁 إعادة نشر</button>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-slate-400 text-xs tracking-widest uppercase pb-10">
          Build by AbdallahMo for Developers • 2026
        </footer>
      </div>
    </main>
  );
}