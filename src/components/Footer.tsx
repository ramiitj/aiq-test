import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t py-8 bg-secondary/20 mt-auto">
      <div className="container px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              About
            </Link>
            <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Privacy Policy
            </Link>
            <Link to="/sitemap" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Sitemap
            </Link>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p className="font-medium leading-relaxed">
              AIQ<sup className="text-[0.6em]">™</sup> is a trademark of AI Works Pvt. Ltd. All Rights Reserved.
            </p>
            <p className="mt-2 leading-relaxed">
              All other trademarks, logos, and brand names are the property of their respective owners.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
