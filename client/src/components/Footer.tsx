import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-card py-4 px-4">
      <div className="container mx-auto text-center text-foreground/60 text-sm">
        <p>Warcry Companion App — Store your data safely in local storage</p>
        <p className="mt-1">
          <Link href="/">
            <a className="text-primary hover:text-primary/80 transition">Privacy Policy</a>
          </Link>
          <span className="mx-2">•</span>
          <Link href="/">
            <a className="text-primary hover:text-primary/80 transition">Terms of Use</a>
          </Link>
          <span className="mx-2">•</span>
          <Link href="/rules">
            <a className="text-primary hover:text-primary/80 transition">Help</a>
          </Link>
        </p>
      </div>
    </footer>
  );
}
