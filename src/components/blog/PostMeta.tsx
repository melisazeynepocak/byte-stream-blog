interface PostMetaProps {
  author: string;
  publishedAt: string;
  readingTime: number;
}

export const PostMeta = ({ author, publishedAt, readingTime }: PostMetaProps) => {
  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground py-4 border-b">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-medium text-primary">
            {author.charAt(0).toUpperCase()}
          </span>
        </div>
        <span>{author}</span>
      </div>
      <span>•</span>
      <span>{new Date(publishedAt).toLocaleDateString("tr-TR")}</span>
      <span>•</span>
      <span>{readingTime} dk okuma</span>
    </div>
  );
};