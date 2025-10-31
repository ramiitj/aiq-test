import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Download, Copy, Linkedin, Twitter, Facebook, Loader2, Share2, CheckCircle, ExternalLink } from "lucide-react";
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
}

export function ShareModal({
  open,
  onOpenChange,
  score,
  dimensions,
  verificationCode,
  verificationUrl,
}: ShareModalProps) {
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [caption, setCaption] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const { toast } = useToast();

  const level = getLevelText(score);
  const topDimensions = [...dimensions].sort((a, b) => b.score - a.score).slice(0, 3);

  useEffect(() => {
    if (open && !imageBlob) {
      generateImage();
      const generatedCaption = generateCaption({
        score,
        level,
        topDimensions,
        verificationUrl,
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
      });
      setImageBlob(blob);
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    } catch (error) {
      toast({
        title: "Error Generating Image",
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
      description: "Your shareable certificate image has been saved.",
    });
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
      toast({
        title: "Caption Copied",
        description: "Caption text copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy caption to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast({
        title: "Link Copied",
        description: "Verification link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy verification link.",
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
      description: "Upload the downloaded image and paste your caption.",
    });
  };

  const handleShareTwitter = () => {
    handleDownloadImage();
    const text = caption.substring(0, 280); // Twitter character limit
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "width=600,height=600");
    toast({
      title: "Opening Twitter",
      description: "Upload the downloaded image to complete your post.",
    });
  };

  const handleShareFacebook = () => {
    handleDownloadImage();
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(verificationUrl)}`;
    window.open(url, "_blank", "width=600,height=600");
    toast({
      title: "Opening Facebook",
      description: "Upload the downloaded image to share your results.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-900/10 rounded-lg">
              <Share2 className="h-6 w-6 text-blue-900" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-bold tracking-tight">Share Your AIQ Results</DialogTitle>
              <DialogDescription className="text-base mt-1">
                Download your certificate and showcase your AI collaboration skills
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8 pt-4">
          {/* Image Preview Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Certificate Preview</h3>
            <div className="border-2 rounded-lg overflow-hidden bg-secondary/30 shadow-sm">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-[315px] gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-900" />
                  <p className="text-sm text-muted-foreground">Generating your certificate...</p>
                </div>
              ) : imageUrl ? (
                <img src={imageUrl} alt="AIQ Results Certificate" className="w-full h-auto" />
              ) : (
                <div className="flex flex-col items-center justify-center h-[315px] text-muted-foreground gap-2">
                  <p className="font-medium">Failed to generate image</p>
                  <Button onClick={generateImage} variant="outline" size="sm">
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Primary Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleDownloadImage}
              disabled={!imageBlob}
              size="lg"
              className="w-full bg-blue-900 hover:bg-blue-800 text-lg py-6"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Certificate
            </Button>
            <Button
              onClick={handleCopyCaption}
              disabled={!caption}
              variant="outline"
              size="lg"
              className="w-full text-lg py-6"
            >
              {copiedCaption ? (
                <>
                  <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-5 w-5" />
                  Copy Caption
                </>
              )}
            </Button>
          </div>

          {/* Caption Editor Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Share Caption</h3>
              <span className="text-sm text-muted-foreground">{caption.length} characters</span>
            </div>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-[180px] text-sm leading-relaxed resize-none"
              placeholder="Edit your caption before sharing..."
            />
            <p className="text-xs text-muted-foreground">
              💡 Tip: Customize this caption to add your personal touch before sharing
            </p>
          </div>

          {/* Social Sharing Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Share on Social Media</h3>
            <div className="grid grid-cols-3 gap-4">
              <Button
                onClick={handleShareLinkedIn}
                disabled={!imageBlob}
                size="lg"
                className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white py-6"
              >
                <Linkedin className="mr-2 h-5 w-5" />
                LinkedIn
              </Button>
              <Button
                onClick={handleShareTwitter}
                disabled={!imageBlob}
                size="lg"
                className="w-full bg-black hover:bg-gray-800 text-white py-6"
              >
                <Twitter className="mr-2 h-5 w-5" />
                Twitter
              </Button>
              <Button
                onClick={handleShareFacebook}
                disabled={!imageBlob}
                size="lg"
                className="w-full bg-[#1877F2] hover:bg-[#0C63D4] text-white py-6"
              >
                <Facebook className="mr-2 h-5 w-5" />
                Facebook
              </Button>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> The certificate image will download automatically when you click a social
                platform. Upload the image and paste your caption when creating your post.
              </p>
            </div>
          </div>

          {/* Verification Link Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Verification Link</h3>
            
            {/* Clickable Hyperlink */}
            <a 
              href={verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-secondary/30 rounded-lg border-2 border-blue-500 hover:border-blue-600 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <code className="text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:underline break-all">
                  {verificationUrl.replace('https://', '').replace('www.', '')}
                </code>
                <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />
              </div>
            </a>
            
            {/* Copy Button Below */}
            <Button onClick={handleCopyLink} variant="outline" size="sm" className="w-full">
              {copiedLink ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Verification Link
                </>
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Share this link to allow others to verify your certificate authenticity
            </p>
          </div>

          {/* Additional Info */}
          <div className="bg-secondary/30 rounded-lg p-6 border">
            <h4 className="font-semibold mb-3 text-base">Sharing Tips</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Add the certificate image to make your post stand out</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Include the verification link so others can validate your results</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Tag relevant hashtags like #AIQ #AISkills #ArtificialIntelligence</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Mention how you plan to use these skills in your work</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
