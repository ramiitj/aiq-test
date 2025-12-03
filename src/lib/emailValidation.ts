/**
 * Email domain validation to block disposable/alias email services
 * These services allow users to create throwaway addresses, which can be used for abuse
 */

// Blocked email domains - disposable, alias, and privacy email services
const BLOCKED_EMAIL_DOMAINS = [
  // Proton/SimpleLogin aliases
  'passmail.net',
  'simplelogin.com',
  'simplelogin.co',
  'aleeas.com',
  'slmail.me',
  
  // Other popular disposable/temporary email services
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'guerrillamail.org',
  'guerrillamail.net',
  'sharklasers.com',
  'grr.la',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me',
  '10minutemail.com',
  '10minutemail.net',
  '10minmail.com',
  'mailinator.com',
  'mailinater.com',
  'mailinator2.com',
  'sofimail.com',
  'tradermail.info',
  'maildrop.cc',
  'dispostable.com',
  'yopmail.com',
  'yopmail.fr',
  'cool.fr.nf',
  'jetable.fr.nf',
  'nospam.ze.tc',
  'nomail.xl.cx',
  'mega.zik.dj',
  'speed.1s.fr',
  'courriel.fr.nf',
  'moncourrier.fr.nf',
  'monemail.fr.nf',
  'monmail.fr.nf',
  'hide.biz.st',
  'mytrashmail.com',
  'throwawaymail.com',
  'throwaway.email',
  'getnada.com',
  'tempail.com',
  'fakeinbox.com',
  'fakemailgenerator.com',
  'emailondeck.com',
  'mohmal.com',
  'discard.email',
  'discardmail.com',
  'spamgourmet.com',
  'mintemail.com',
  'tempinbox.com',
  'emailfake.com',
  'crazymailing.com',
  'tempmailo.com',
  'emailtemporanea.com',
  'emailtemporanea.net',
  'emailtemporario.com.br',
  'tempr.email',
  'discard.email',
  'mailsac.com',
  'inboxkitten.com',
  'burnermail.io',
  'mailnesia.com',
  'spamex.com',
  'trashmail.com',
  'trashmail.net',
  'trashmail.org',
  'trashmail.ws',
  'mail-temporaire.fr',
  'temporarymail.net',
  'wegwerfmail.de',
  'wegwerfmail.net',
  'wegwerfmail.org',
  'spamfree24.org',
  'spamfree24.de',
  'spamfree24.info',
  'getairmail.com',
  'dropmail.me',
  'mailcatch.com',
  'tempmailaddress.com',
  'emailsensei.com',
  'anonymbox.com',
  'hushmail.com', // Privacy-focused email that's often abused
  'tutanota.com', // Privacy-focused but legitimate - consider removing if too strict
  'tutanota.de',
  'tutamail.com',
  'tuta.io',
  'cock.li',
  'airmail.cc',
  'dnmx.org',
  '420blaze.it',
  'aaathats3as.com',
  'horsefucker.org',
  // Duck.com aliases (DuckDuckGo email protection)
  'duck.com',
  // Firefox Relay
  'relay.firefox.com',
  'mozmail.com',
  // Apple Hide My Email (iCloud private relay)
  'privaterelay.appleid.com',
  // Fastmail aliases
  'sent.com',
  'sent.at',
  // Anonaddy
  'anonaddy.com',
  'anonaddy.me',
  // 33mail
  '33mail.com',
  // Blur/Abine
  'opayq.com',
  // Mailbox.org disposable
  'secure.mailbox.org',
];

/**
 * Check if an email domain is blocked
 */
export const isBlockedEmailDomain = (email: string): boolean => {
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return false;
  
  return BLOCKED_EMAIL_DOMAINS.some(blocked => 
    domain === blocked || domain.endsWith('.' + blocked)
  );
};

/**
 * Get a user-friendly error message for blocked emails
 */
export const getBlockedEmailMessage = (): string => {
  return "Registration with disposable or alias email addresses is not permitted. Please use your primary email address.";
};

/**
 * Validate email for registration/access
 * Returns { valid: true } or { valid: false, message: string }
 */
export const validateEmailForRegistration = (email: string): { valid: boolean; message?: string } => {
  if (!email || !email.includes('@')) {
    return { valid: false, message: "Please enter a valid email address" };
  }
  
  if (isBlockedEmailDomain(email)) {
    return { valid: false, message: getBlockedEmailMessage() };
  }
  
  return { valid: true };
};
