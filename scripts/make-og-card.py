"""
Builds public/og.png — the card WhatsApp, Messenger and Facebook show when
someone shares the site.

    python3 scripts/make-og-card.py

Run it whenever a fact on the card changes. It is a script and not a design
file because every line on it is a fact that will go out of date: the year, the
number of patients, the phone number.

Two things it is easy to get wrong here, both learned the hard way:

  Punctuation. The Bengali cut of Anek has no Latin comma, so "২০,০০০" renders
  a hollow box in the middle of the number. Use "২০ হাজার", and the danda for
  sentence ends.

  The logo. public/assets/Icons/logo.png is Mistri Solutions Limited, left over
  from whoever built the original site. Senso's mark is the one used below, and
  it is sized by height — sized by width it runs off the bottom of the card and
  loses the "HEARING CENTRE DHAKA" line, which is the half that says what the
  business does.

Fonts come from the system (fonts-anek-bangla). The site loads the same family
over the web, so the card and the page it opens are set in one typeface.
"""
import pathlib
import re

from PIL import Image, ImageDraw, ImageFont


def phone_display() -> str:
    """The primary number, read out of src/lib/site.ts.

    Not typed here. This script bakes the number into a PNG, and a PNG is the
    one copy that cannot be grepped and that nobody notices has gone stale --
    the card went out with a wrong number on it for weeks. Reading the TypeScript
    constant means the card is wrong only if the site is wrong.
    """
    site = pathlib.Path(__file__).resolve().parent.parent / "src" / "lib" / "site.ts"
    m = re.search(r'const PHONE_PRIMARY = "([^"]+)"', site.read_text(encoding="utf-8"))
    if not m:
        raise SystemExit("PHONE_PRIMARY not found in src/lib/site.ts -- was it renamed?")
    return m.group(1)

# The site's own palette and its own typeface — an OG card that does not look
# like the page it opens is worse than none.
PAPER = (250, 246, 240)
SURFACE = (255, 253, 250)
INK = (34, 31, 27)
INK2 = (92, 85, 76)
BRAND = (180, 35, 28)
LINE = (227, 216, 200)

W, H = 1200, 630
F = "/usr/share/fonts/truetype/anekbangla/AnekBangla-bengali-%s.ttf"
L = "/usr/share/fonts/truetype/anekbangla/AnekBangla-latin-%s.ttf"

img = Image.new("RGB", (W, H), PAPER)
d = ImageDraw.Draw(img)

# One quiet mark: a red rule down the left, the way the site uses its red.
d.rectangle([0, 0, 10, H], fill=BRAND)

pad = 78

eyebrow = ImageFont.truetype(L % "600", 25)
# The year moves into the headline, so the eyebrow carries the other proof.
d.text((pad, 92), "PANTHAPATH, DHAKA  ·  AUTHORISED RESOUND DEALER",
       font=eyebrow, fill=BRAND)

# The headline is the search, in the language most people search in.
head = ImageFont.truetype(F % "700", 74)
# Stature told as a count and a date rather than a superlative. "সবচেয়ে বড়"
# is a claim someone can be asked to prove; years and patients are facts the
# clinic owns.
#
# "২০ হাজার" and not "২০,০০০" — the Bengali subset of this font has no Latin
# comma, so the numeral form renders a hollow box mid-number. The written form
# reads more naturally in Bangla anyway.
d.text((pad, 150), "২০০৭ সাল থেকে", font=head, fill=INK)
d.text((pad, 238), "২০ হাজার রোগীর সেবায়", font=head, fill=INK)

sub = ImageFont.truetype(F % "500", 33)
# One line, not two. The first draft said "দাম লেখা আছে" directly under a
# headline that already said it — and the space it leaves is worth more than
# the sentence it held.
#
# Only the danda for punctuation: the Bengali subset of this font has no Latin
# comma, and a missing glyph renders as a hollow box.
# The strongest line available, and it is not the clinic's own claim: other
# institutions send their patients here.
d.text((pad, 368), "দেশের বড় হাসপাতালগুলো থেকে রোগী আসে এখানে।", font=sub, fill=INK2)

# A hairline above the footer, so the mark sits apart from the claim.
d.line([(pad, 486), (W - pad, 486)], fill=LINE, width=2)

# The real logo rather than the name set in type. It was the wrong file at
# first — public/assets/Icons/logo.png is Mistri Solutions Limited, left over
# from whoever built the original site.
# Sized by HEIGHT. Sized by width, the two-line mark ran off the bottom of the
# card and lost "HEARING CENTRE DHAKA" — the half that says what the business
# does.
logo = Image.open(pathlib.Path(__file__).resolve().parent.parent
                  / "public" / "assets" / "Images" / "Common" / "sensoLogo.png").convert("RGBA")
lh = 96
lw = round(logo.width * lh / logo.height)
logo = logo.resize((lw, lh), Image.LANCZOS)
img.paste(logo, (pad, 502), logo)

# The number belongs on a card someone is looking at on a phone: for a clinic
# it is the whole call to action, and a share is often forwarded to the person
# who will actually ring.
phone = ImageFont.truetype(L % "700", 40)
site = ImageFont.truetype(L % "500", 25)

# The number is read from src/lib/site.ts rather than typed: this script
# writes it into a PNG, which is the one copy nobody notices is stale.
pn = phone_display()
b = d.textbbox((0, 0), pn, font=phone)
d.text((W - pad - (b[2] - b[0]), 508), pn, font=phone, fill=BRAND)

sn = "sensohearingdhaka.com"
b = d.textbbox((0, 0), sn, font=site)
d.text((W - pad - (b[2] - b[0]), 558), sn, font=site, fill=INK2)

# Ready for the day Naati is switched back on. It goes on the card in the same
# commit that turns the assistant on and not before: a card that promises an AI
# consultation, linking to a site with no AI on it, loses the visit and the
# trust in one tap.
#
#   d.text((pad, 368), "দেশের প্রথম AI-ভিত্তিক শ্রবণ পরামর্শ সেবা।", font=sub, fill=INK2)

import pathlib
out = pathlib.Path(__file__).resolve().parent.parent / "public" / "og.png"
img.save(out, optimize=True)
print("written", out, img.size)
