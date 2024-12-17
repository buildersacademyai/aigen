import { Button } from "@/components/ui/button";
import { SiFacebook, SiXing as SiTwitter, SiLinkedin, SiTiktok } from "react-icons/si";

interface SocialShareProps {
  url: string;
  title: string;
}

export function SocialShare({ url, title }: SocialShareProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shares = [
    {
      name: "Facebook",
      icon: SiFacebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "Twitter",
      icon: SiTwitter,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "LinkedIn",
      icon: SiLinkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "TikTok",
      icon: SiTiktok,
      url: `https://www.tiktok.com/share?url=${encodedUrl}`,
    },
  ];

  return (
    <div className="flex gap-2">
      {shares.map((share) => (
        <Button
          key={share.name}
          variant="outline"
          size="icon"
          className="transition-all duration-200 hover:scale-110 hover:bg-primary hover:text-primary-foreground"
          onClick={() => window.open(share.url, "_blank")}
        >
          <share.icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}
