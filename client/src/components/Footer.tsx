import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-card py-4 px-4">
      <div className="container mx-auto text-center text-foreground/60 text-sm">
        <p>Warcry Companion App — Store your data safely in the cloud</p>
        <p className="mt-1">
          <Link href="/privacy" className="text-primary hover:text-primary/80 transition">Privacy Policy</Link>
          <span className="mx-2">•</span>
          <Link href="/terms" className="text-primary hover:text-primary/80 transition">Terms of Service</Link>
          <span className="mx-2">•</span>
          <Link href="/rules" className="text-primary hover:text-primary/80 transition">Help</Link>
        </p>
      </div>
    </footer>
  );
}
