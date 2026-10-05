---
title: Characters of Meaning
tags: [AI, Claude, typography, chinese, etymology]
collection: artefato da semana/7
---

# Characters of Meaning

Chinese characters are not arbitrary shapes like Latin letters: many of 
them are literally combinations of other, simpler characters, which 
together convey the word’s meaning. This animation shows this construction 
process in action: the elements come together and merge to form the final 
character, while the pronunciation (Pinyin) and the English meaning gradually 
appear below. Click anywhere on the screen to move to the next character.

## Why this idea

I studied Chinese for three years in high school, and that was the first 
idea that came to mind for this week’s artifact theme. Unlike Chinese 
characters, alphabetic writing doesn’t allow you to directly understand 
the meaning of a word without knowing it beforehand, which isn’t the case 
with Chinese: 明 (bright) is literally composed of 日 (sun) next to 月 (moon), 
and the character 休 (rest) literally depicts a person, 人, leaning against a 
tree,木. Typography generally involves treating the shapes of letters as 
geometric forms; this work retains that geometry but highlights the meaning 
hidden behind it.

## What's in the sequence

- 木 → 林 → 森 : tree → grove (two trees) → forest (three trees)
- 日 + 月 → 明 : sun + moon → bright
- 人 + 木 → 休 : person + tree → rest
- 女 + 子 → 好 : woman + child → good
- 日 + 本 → 日本 : "origin of the sun" → Japan
- 中 + 国 → 中国 : "the middle kingdom" → China

## How it works

- Each character's real components are drawn with `text()`, each starting
at a random point off-screen, and eased toward their positions with
`lerp()` nothing about the final layout is drawn directly.
- Each component carries its own pinyin + meaning caption directly
underneath it, which travels with it as it flies in (captions alternate
onto two rows so close characters never collide).
- Once the parts arrive, they cross-fade into the actual fused character
(for the single-character examples), with its own caption below
which is what makes the construction feel earned rather than
illustrated. For the two-character words (日本, 中国), the parts stay
as themselves and a final combined caption fades in below both.
- Pinyin and meaning fade in afterwards, then everything fades out and
the next character begins, a small state machine driven by
`frameCount`, with a click able to skip ahead at any time.
- The font (Noto Serif SC, for the Chinese glyphs, and Noto Sans for the
captions) is loaded from Google Fonts by `index.html` and confirmed
ready with the browser's font-loading API before drawing starts, so no
font file is bundled in this zip.

## AI usage

Built with the help of the AI Claude. I gave my own idea, animating
real Chinese character etymology and I gave examples of the chinese
words I knew : Japan, China, forest and good. Claude picked the others,
I gave him a first version of the code that he corrected and sent me
back and I chose the timings, the colours and how the characters appear
on the screen. 

Author: Yasmine
