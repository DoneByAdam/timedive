import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-6 mt-auto">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} TimeDive</span>
        <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
      </div>
    </footer>
  );
}
