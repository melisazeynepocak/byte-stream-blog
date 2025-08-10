import { useState } from "react";
import { Seo } from "@/components/Seo";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.includes("@") || message.trim().length < 10) {
      toast({ title: "Form hatalı", description: "Lütfen tüm alanları geçerli biçimde doldurun." });
      return;
    }
    // Demo: mesajı sadece localStorage'a yazıyoruz
    const prev = JSON.parse(localStorage.getItem("contact.messages") || "[]");
    prev.push({ id: crypto.randomUUID(), name, email, message, createdAt: new Date().toISOString() });
    localStorage.setItem("contact.messages", JSON.stringify(prev));
    toast({ title: "Teşekkürler", description: "Mesajınız başarıyla gönderildi." });
    setName(""); setEmail(""); setMessage("");
  };

  return (
    <>
      <Seo title="İletişim – TeknoBlog" description="Bize ulaşın: öneri, iş birliği ve düzeltme talepleri." />
      <main className="container py-10 max-w-2xl">
        <h1 className="text-3xl font-extrabold mb-6">İletişim</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input placeholder="Adınız" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input type="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Textarea placeholder="Mesajınız (en az 10 karakter)" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} required />
          <button type="submit" className="px-4 py-2 rounded bg-primary text-primary-foreground">Gönder</button>
        </form>
        <p className="text-xs text-muted-foreground mt-4">Mesaj göndererek <a className="underline" href="/gizlilik-politikasi">Gizlilik Politikası</a> ve <a className="underline" href="/cerez-politikasi">Çerez Politikası</a>'nı kabul etmiş olursunuz.</p>
      </main>
    </>
  );
};

export default Contact;
