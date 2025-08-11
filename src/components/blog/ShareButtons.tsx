import { Share, Heart, MessageCircle, Bookmark } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
  className?: string;
}

export const ShareButtons = ({ url, title, className }: ShareButtonsProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const shareLinks = [
    {
      name: "Twitter/X",
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: "𝕏",
      color: "hover:bg-black hover:text-white",
    },
    {
      name: "Facebook", 
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: "f",
      color: "hover:bg-blue-600 hover:text-white",
    },
    {
      name: "LinkedIn",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: "in",
      color: "hover:bg-blue-700 hover:text-white",
    },
    {
      name: "WhatsApp",
      url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      icon: "W",
      color: "hover:bg-green-500 hover:text-white",
    },
  ];

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Social Share Buttons */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Paylaş</span>
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-10 h-10 rounded-full border bg-background ${link.color} transition-colors flex items-center justify-center text-sm font-bold`}
            title={`${link.name}'da paylaş`}
          >
            {link.icon}
          </a>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-2 border-t">
        <button
          onClick={() => setIsLiked(!isLiked)}
          className={`w-10 h-10 rounded-full border transition-colors flex items-center justify-center ${
            isLiked ? "bg-red-500 text-white" : "bg-background hover:bg-red-50 hover:border-red-200"
          }`}
          title="Beğen"
        >
          <Heart className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} />
        </button>
        
        <button
          className="w-10 h-10 rounded-full border bg-background hover:bg-accent transition-colors flex items-center justify-center"
          title="Yorum yap"
          onClick={() => {
            const commentsSection = document.getElementById("comments");
            if (commentsSection) {
              commentsSection.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          <MessageCircle className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`w-10 h-10 rounded-full border transition-colors flex items-center justify-center ${
            isBookmarked ? "bg-amber-500 text-white" : "bg-background hover:bg-amber-50 hover:border-amber-200"
          }`}
          title="Kaydet"
        >
          <Bookmark className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
};