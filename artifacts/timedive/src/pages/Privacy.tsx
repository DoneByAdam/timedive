export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <article className="prose prose-invert dark:prose-invert max-w-none prose-headings:text-primary prose-a:text-primary">
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: August 2026</p>

        <p>
          TimeDive ("we," "us," "TimeDive") is a history-learning app that generates personalized
          stories about historical topics. This page explains what information we collect, why,
          and how it's handled.
        </p>

        <h2>Information we collect</h2>
        <ul>
          <li><strong>Account information:</strong> email address and password (stored as a one-way cryptographic hash — we never store or see your actual password), and a display name.</li>
          <li><strong>Profile information:</strong> age, a reading-level setting (kid / teen / adult), grade level, and an optional avatar (chosen from a set of preset icons — not an uploaded photo).</li>
          <li><strong>Preferences:</strong> hobbies and interests you provide (sports, video games, movies, books, etc.) and, optionally, your city/country, used to personalize generated stories.</li>
          <li><strong>Generated content:</strong> the stories our AI generates for you are saved to your account so you can read or listen to them again later, and optionally shared via a link you control.</li>
          <li><strong>Contact form submissions:</strong> if you use the Contact Us form, we store the name, email, and message you provide.</li>
          <li><strong>Session data:</strong> a session cookie (web) or a signed token (mobile app) that keeps you logged in. We don't use third-party advertising or analytics trackers.</li>
        </ul>

        <h2>How we use this information</h2>
        <ul>
          <li>To create and secure your account, and to remember your progress across visits.</li>
          <li>To personalize story generation to your age, reading level, and interests.</li>
          <li>To send account-related emails: verifying your email address, password reset links, and replies to messages you send us.</li>
          <li>To respond to messages sent through the Contact Us form.</li>
        </ul>
        <p>We do not sell your personal information, and we do not use it for advertising.</p>

        <h2>Who we share information with</h2>
        <p>We use a small number of service providers to run TimeDive. Each only receives what it needs to do its job:</p>
        <ul>
          <li><strong>Anthropic</strong> (Claude API) — generates story text. The request includes the topic, your reading-level setting, and the interests you've chosen; it does not include your email, password, or name.</li>
          <li><strong>Neon</strong> — hosts our database (all the information described above).</li>
          <li><strong>Railway</strong> — hosts our application servers.</li>
          <li><strong>Resend</strong> — delivers account emails (verification, password reset) and contact form notifications.</li>
        </ul>
        <p>We don't share your information with anyone else, except where required by law.</p>

        <h2>Children's privacy</h2>
        <p>
          TimeDive is designed to be usable and enjoyable for children, including a "kid" reading
          level. If you are a parent or guardian and believe your child has provided us with
          personal information, please contact us at{' '}
          <a href="mailto:contact@mytimedive.com">contact@mytimedive.com</a> and we will work
          with you regarding that information, including deleting it if you request.
        </p>

        <h2>Your choices</h2>
        <ul>
          <li>You can review and update most of your profile information anytime from your account's Profile page.</li>
          <li>You can stop sharing any story you've shared at any time from that story's page.</li>
          <li>To request that we delete your account and associated data, email <a href="mailto:contact@mytimedive.com">contact@mytimedive.com</a> from the address on your account.</li>
        </ul>

        <h2>Data security</h2>
        <p>
          Passwords are hashed and never stored in plain text. Data is transmitted over encrypted
          (HTTPS) connections. No method of transmission or storage is 100% secure, but we work to
          protect your information using industry-standard practices.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          If we make material changes to this policy, we'll update the date at the top of this
          page.
        </p>

        <h2>Contact us</h2>
        <p>
          Questions about this policy or your data? Email{' '}
          <a href="mailto:contact@mytimedive.com">contact@mytimedive.com</a> or use our{' '}
          <a href="/contact">Contact Us</a> form.
        </p>
      </article>
    </div>
  );
}
