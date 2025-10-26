import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Download, Copy, Linkedin, Twitter, Facebook, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateSocialMediaImage, getLevelText } from "@/lib/socialMediaGenerator";
import { generateCaption } from "@/lib/captionGenerator";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  score: number;
  dimensions: Array<{ name: string; score: number }>;
  verificationCode: string;
  verificationUrl: string;
  percentile?: number | null;
}

export function ShareModal({
  open,
  onOpenChange,
  score,
  dimensions,
  verificationCode,
  verificationUrl,
  percentile,
}: ShareModalProps) {
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [caption, setCaption] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const level = getLevelText(score);
  const topDimensions = [...dimensions]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  useEffect(() => {
    if (open && !imageBlob) {
      generateImage();
      const generatedCaption = generateCaption({
        score,
        level,
        topDimensions,
        verificationUrl,
        percentile,
      });
      setCaption(generatedCaption);
    }
  }, [open]);

  const generateImage = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateSocialMediaImage({
        score,
        level,
        verificationCode,
        dimensions: topDimensions,
        verificationUrl,
        percentile,
      });
      setImageBlob(blob);
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    } catch (error) {
      // Error already shown to user via toast
      toast({
        title: "Error",
        description: "Failed to generate share image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = () => {
    if (!imageBlob) return;

    const url = URL.createObjectURL(imageBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `AIQ-Results-${verificationCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Image Downloaded",
      description: "Your shareable image has been downloaded.",
    });
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      toast({
        title: "Caption Copied",
        description: "Caption text copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy caption.",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      toast({
        title: "Link Copied",
        description: "Verification link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link.",
        variant: "destructive",
      });
    }
  };

  const handleShareLinkedIn = () => {
    handleDownloadImage();
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}`;
    window.open(url, "_blank", "width=600,height=600");
    toast({
      title: "Opening LinkedIn",
      description: "Paste your caption and attach the downloaded image.",
    });
  };

  const handleShareTwitter = () => {
    handleDownloadImage();
    const text = caption.substring(0, 280); // Twitter character limit
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "width=600,height=600");
  };

  const handleShareFacebook = () => {
    handleDownloadImage();
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(verificationUrl)}`;
    window.open(url, "_blank", "width=600,height=600");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Share Your AIQ Results</DialogTitle>
          <DialogDescription>
            Download your certificate and share with your network
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Preview */}
          <div className="border rounded-lg overflow-hidden bg-muted">
            {isGenerating ? (
              <div className="flex items-center justify-center h-[315px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt="AIQ Results Certificate"
                className="w-full h-auto"
              />
            ) : (
              <div className="flex items-center justify-center h-[315px] text-muted-foreground">
                Failed to generate image
              </div>
            )}
          </div>

          {/* Caption Editor */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              📝 Caption (edit before sharing)
            </label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
              placeholder="Edit your caption..."
            />
            <p className="text-xs text-muted-foreground">
              {caption.length} characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleDownloadImage}
              disabled={!imageBlob}
              size="lg"
              className="w-full"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Image
            </Button>
            <Button
              onClick={handleCopyCaption}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <Copy className="mr-2 h-5 w-5" />
              Copy Caption
            </Button>
          </div>

          {/* Social Sharing */}
          <div className="space-y-3">
            <label className="text-sm font-semibold">Share to:</label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={handleShareLinkedIn}
                disabled={!imageBlob}
                variant="outline"
                size="lg"
                className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white border-[#0A66C2]"
              >
                <Linkedin className="mr-2 h-5 w-5" />
                LinkedIn
              </Button>
              <Button
                onClick={handleShareTwitter}
                disabled={!imageBlob}
                variant="outline"
                size="lg"
                className="w-full bg-black hover:bg-gray-800 text-white border-black"
              >
                <Twitter className="mr-2 h-5 w-5" />
                Twitter
              </Button>
              <Button
                onClick={handleShareFacebook}
                disabled={!imageBlob}
                variant="outline"
                size="lg"
                className="w-full bg-[#1877F2] hover:bg-[#0C63D4] text-white border-[#1877F2]"
              >
                <Facebook className="mr-2 h-5 w-5" />
                Facebook
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Image will download automatically. Paste caption when posting.
            </p>
          </div>

          {/* Verification Link */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              🔗 Verification Link
            </label>
            <div className="flex gap-2">
              <Input
                value={verificationUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button onClick={handleCopyLink} variant="outline" size="lg">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
