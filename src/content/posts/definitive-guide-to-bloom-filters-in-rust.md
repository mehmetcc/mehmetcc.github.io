---
title: "The Definitive Guide to Bloom Filters (in Rust)"
description: "An in-depth exploration of key concepts behind Bloom Filters, with a complete implementation in Rust."
pubDate: 2025-12-27
tags: ["Rust", "Data Structures", "Bloom Filters"]
---
I read a Reddit post a while ago with a meme attached, making fun of people who had just learned about arenas and bloom filter and tried to apply their new-found knowledge to everything. For what it's worth, if you have recently acquired a hammer, everything is a nail.

I know every programming language community has its own idea of what arenas are, so it’s pointless to think of it as a single thing, but rather a concept of being totally zen. And maybe the real arenas were the friends we made along the way.

But Bloom Filters are different. They have been an integral part of the Computer Science ethos long before I was born and have been applied to many problems that are worth solving. I used them in a plethora of languages, implemented them over and over again. So I was confident enough in my practical skills to implement one. Only after running `cargo new bloom_filter`, I realized I did not know what I was supposed to do without copy-pasting a bunch of formulas I didn’t understand onto my screen.

As such, we are going to demystify bloom filters in this post, focusing on _why_ they work, not just _how_ to implement them. I am not going to bore you by plagiarising the entire [Wikipedia article](https://en.wikipedia.org/wiki/Bloom_filter) but rather we will focus on explaining the theoretical aspects of the subject practically. We will also come up with a Rust implementation, because all the cool kids started coding with it recently.

## What is a Bloom Filter?
I am terrible with names. But I am really good with faces. I often spend time with someone and become good friends, only to learn their name weeks later. That being said, time flies and faces change; and every once in a while I encounter someone who I don't recognize at all. But I can easily tell when I have never seen someone’s face before.

A bloom filter works in a similar way. At its core, it answers a very specific question:

> Have I definitely not seen this face before?

Notice the phrasing. Like me, a bloom filter can confidently say if it has _never seen_ a face before.

- If it says no, you can trust it completely. That face is new. 
- If it says yes, that's a maybe. It is hedging its bets. We’ve all had those embarrassing moments when we approach someone we think we know, only to realize it’s someone else.

There are countless ways to illustrate bloom filters: you could compare them to the guest list of a Berlin Techno Club, or to the past and future roster of Fenerbahçe SK. But instead of spinning more analogies, let’s see what they really are under the hood.

Formally, a bloom filter is a fixed-size array of bits. To insert an item, we run **k** different hash functions to map it to positions in the array and flip the corresponding bits to 1. Later, when we want to check if an item is already in the filter, we run the same **k** hash functions and look at those positions. If any of the bits are 0, we can confidently say the item is definitely new. If all the bits are 1, the item might already be in the filter; there’s a small chance of a false positive.

Here's some Javascript to better visualize the concepts:

<!-- JS-based script to render a bloom filter visualization -->
<div style="font-family:sans-serif; max-width:600px; margin:20px auto; padding:20px; border:1px solid #ddd; border-radius:12px; background:linear-gradient(to bottom, #f8f9fc, #ffffff); box-shadow:0 4px 12px rgba(0,0,0,0.1); overflow-x: auto;">
  <h3 style="margin-bottom:15px; text-align:center; color:#333; font-size:1.5em;">Bloom Filter Visualizer</h3>
  
  <div style="display:flex; gap:8px; margin-bottom:15px;">
    <input id="bfInput" placeholder="Enter a value..." style="flex:1; padding:10px; border:1px solid #ccc; border-radius:6px; font-size:1em; outline:none; transition:border-color 0.2s;">
    <button onclick="addBF()" style="padding:10px 15px; background:#4CAF50; color:white; border:none; border-radius:6px; cursor:pointer; transition:background 0.2s;">Add</button>
    <button onclick="queryBF()" style="padding:10px 15px; background:#2196F3; color:white; border:none; border-radius:6px; cursor:pointer; transition:background 0.2s;">Query</button>
    <button onclick="resetBF()" style="padding:10px 15px; background:#f44336; color:white; border:none; border-radius:6px; cursor:pointer; transition:background 0.2s;">Reset</button>
  </div>
  
  <div id="bitContainer" style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin-bottom:15px; padding:10px; background:#f0f4f8; border-radius:8px;"></div>
  
  <div style="font-size:0.95em; margin-bottom:10px; text-align:center; color:#555;">
    <span id="hash1Display">Hash1: -</span> | 
    <span id="hash2Display">Hash2: -</span>
  </div>
  
  <div id="bfMessage" style="font-size:0.95em; margin-top:10px; min-height:1.2em; text-align:center; color:#333; font-weight:500;"></div>
</div>

<script>
const SIZE = 12;
let bits = Array(SIZE).fill(0);

function h1(s){let h=0; for(let i=0;i<s.length;i++){h=(h<<5)-h+s.charCodeAt(i); h=h&h;} return Math.abs(h)%SIZE;}
function h2(s){let h=5381; for(let i=0;i<s.length;i++){h=(h<<5)+h+s.charCodeAt(i);} return Math.abs(h)%SIZE;}

function renderBits(highlight=[]){
  const container = document.getElementById('bitContainer');
  container.innerHTML='';
  bits.forEach((b,i)=>{
    const div=document.createElement('div');
    div.style.width=div.style.height='32px';
    div.style.borderRadius='50%';
    div.style.background=b ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e0e0e0';
    div.style.color=b ? '#fff' : '#666';
    div.style.display='flex';
    div.style.alignItems='center';
    div.style.justifyContent='center';
    div.style.fontSize='0.9em';
    div.style.fontWeight='bold';
    div.style.transition='background 0.3s, transform 0.2s';
    div.textContent=b ? 1 : 0;
    if(highlight.includes(i)) {
      div.style.outline='2px solid #f5576c';
      div.style.transform='scale(1.1)';
    }
    container.appendChild(div);
  });
}

function showMessage(msg, color='#333'){ 
  const msgElem = document.getElementById('bfMessage');
  msgElem.textContent=msg; 
  msgElem.style.color=color;
  msgElem.style.transition='opacity 0.3s';
  msgElem.style.opacity=0;
  setTimeout(() => msgElem.style.opacity=1, 10);
}

function addBF(){
  const val=document.getElementById('bfInput').value.trim();
  if(!val){ showMessage('Please enter a value', '#f44336'); return; }
  const i1=h1(val), i2=h2(val);
  bits[i1]=1; bits[i2]=1;
  document.getElementById('hash1Display').textContent='Hash1: '+i1;
  document.getElementById('hash2Display').textContent='Hash2: '+i2;
  renderBits([i1,i2]);
  showMessage(`Added "${val}" (bits ${i1} & ${i2})`, '#4CAF50');
  document.getElementById('bfInput').value='';
}

function queryBF(){
  const val=document.getElementById('bfInput').value.trim();
  if(!val){ showMessage('Please enter a value', '#f44336'); return; }
  const i1=h1(val), i2=h2(val);
  document.getElementById('hash1Display').textContent='Hash1: '+i1;
  document.getElementById('hash2Display').textContent='Hash2: '+i2;
  renderBits([i1,i2]);
  if(bits[i1] && bits[i2]) showMessage(`"${val}" might be in the set`, '#2196F3');
  else showMessage(`"${val}" is definitely NOT in the set`, '#f44336');
  document.getElementById('bfInput').value='';
}

function resetBF(){ 
  bits.fill(0); 
  renderBits(); 
  showMessage('Bloom Filter reset', '#888'); 
  document.getElementById('hash1Display').textContent='Hash1: -'; 
  document.getElementById('hash2Display').textContent='Hash2: -'; 
}

renderBits();

// Add hover effects to buttons
document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('mouseover', () => btn.style.opacity = 0.9);
  btn.addEventListener('mouseout', () => btn.style.opacity = 1);
});

// Focus effect on input
document.getElementById('bfInput').addEventListener('focus', () => {
  document.getElementById('bfInput').style.borderColor = '#667eea';
});
document.getElementById('bfInput').addEventListener('blur', () => {
  document.getElementById('bfInput').style.borderColor = '#ccc';
});
</script>
<!-- Script ends.. -->

Bloom filters are fixed-size. We also have to specify two different constants: **n** and **m**.

- **n** is the number of items we anticipate being inserted. 
- **m** is the size of the bit array. The bigger the *m* is, the fewer false positives we will get.

Choosing these constants carefully is crucial for an optimal bloom filter. Too many hash functions can slow down execution, since each hash function call is computationally costly. Meanwhile, a very large bit array can increase memory usage. Luckily, there’s a way to mathematically choose the optimal values. We'll cover this during the implementation phase.

## Bit Arrays
To have a functioning bloom filter, we need a bit array and a hash function implementation. Luckily, both are available within Rust ecosystem.

However, since the point of this exercise is to learn, we’ll implement our own bit array as well, like [real programmers](https://homepages.inf.ed.ac.uk/rni/papers/realprg.html) do. That way, we can also see how bitwise operations work.

We start with a simple struct, aptly named BitArray:

```rust
#[derive(Debug)]
pub struct BitArray {
    bits: Vec<u64>,
    len: usize,
}
```

and a constructor:

```rust
impl BitArray {
    pub fn new(size: usize) -> Self {
        let words = size.div_ceil(64);
        Self {
            bits: vec![0u64; words],
            len: size,
        }
    }
    ...
}
```
Notice the call to `div_ceil(64)` on our size. A bit array is just a bunch of bits stored together, and we organize them into 64-bit integers (`u64`).

Now imagine we want a bit array of size 70. If we just did normal integer division (70 / 64), we would get 1. That gives us only 64-bits, which isn’t enough to store all 70-bits.

To prevent this, we round up the division result using div_ceil. This ensures we allocate enough 64-bit [words](https://en.wikipedia.org/wiki/Word_(computer_architecture)) to store every bit, even if the last word isn’t fully filled. In our example, `70.div_ceil(64)` gives 2 words, giving us 128-bits in total.

Another design choice we made was to use 64-bit words. If you want to use 8-bit words, go for it. In that case, you have to divide by 8 rather than 64. But for what it’s worth, 64-bit words are better optimized than 8-bit words, since we can store many more bits with fewer words.

Now let us implement get and set functionality for our bit array. As you can see, we store bits inside a word, so we first have to determine which word we are looking for. Afterwards, we look inside that word to find the specific bit we need. Since we do this for both get and set, we might as well write a helper method to reduce code duplication:

```rust
impl BitArray {
  ...
    #[inline(always)]
    fn peek(&self, index: usize) -> Option<(usize, u8)> {
        if index >= self.len {
            return None;
        }

        Some((index / 64, (index % 64) as u8))
    }
}
```

Consequently, we first divide by 64 to find the word index, then perform a modulo operation to find the exact place of the bit. Furthermore, since peek is always going to be in the hot path of our program, we tell the compiler to always [inline](https://nnethercote.github.io/perf-book/inlining.html) it. That way, we gain a slight performance boost.


We also perform an if-check to prevent possible overflows. Remember that our bit array is fixed in size, and attempting to insert more elements than it supports will cause all kinds of headaches.

Coming from a Scala background, I prefer concrete types in situations like this rather than using tuple fields. This allows us to name things explicitly, and when we revisit the code a year later we can clearly understand what we were thinking at the time. So let us refactor the code slightly:

```rust
#[derive(Copy, Clone)]
struct Lookup {
    word_index: usize,
    bit_offset: u8,
}
```

and now we can return an optional Lookup value from our peek method:

```rust
impl BitArray {
  ...
    #[inline(always)]
    fn peek(&self, index: usize) -> Option<Lookup> {
        if index >= self.len {
            return None;
        }

        Some(Lookup {
            word_index: index / 64,
            bit_offset: (index % 64) as u8,
        })
    }
}
```

Done! 

Before starting this project, I skimmed through several Rust data structure implementations and noticed a few recurring patterns:

1. When failure is expected and recoverable, Rust APIs usually return Option or Result, making error cases explicit in the type system.
2. When accessing data via indexing (with `[]`), violations such as out of bounds access or missing keys result in a panic.
3. For data structures where replacing an existing value is meaningful (like maps) successful insertions typically return the previous value, if any.
   
As such, we are going to design our public-facing array API with these principles in mind.

Let us implement get and set methods:

```rust
impl BitArray {
  ...
    pub fn set(&mut self, index: usize) -> Option<bool> {
        let lookup = self.peek(index)?;
        let mask = 1u64 << lookup.bit_offset;
        let byte = &mut self.bits[lookup.word_index];

        let previous = (*byte & mask) != 0;
        *byte |= mask;

        Some(previous)
    }

    pub fn get(&self, index: usize) -> Option<bool> {
        let lookup = self.peek(index)?;
        Some((self.bits[lookup.word_index] & 
        (1u64 << lookup.bit_offset)) != 0)
    }
}
```

There is a lot to unpack here. To do that, we need to understand a simple Computer Science trick, called _masking_:

## Masking
Now, let us go back to one of our earliest examples. We wanted to have a bit array of size 70, so we allocated two `u64` words to get there. But these are just integers, right? And we are dividing them to find bits? Most of us (including the author, yours truly) code in either Java or Python, and come up with web slop that somehow makes millions. We seldom hear about bits, and the last time we probably heard of words was during college, failing a Computer Architecture class.

As a result, most of what we did up until now can be seen as a house of cards. This is natural, and to be expected. But I promise, all of this will come together once we understand how masking works.

Let us imagine we have an 8-bit value:

<!-- This used to be all text, until I let Gemini-CLI proof-read my work -->
<!-- Being a good Samaritan, it gifted me with these amazing visuals -->
<!-- The code is unmaintainable mess, but I am not complaining about the way it looks -->
<style>
.bit-op-vis {
    font-family: 'Fira Code', 'Courier New', Courier, monospace;
    background-color: #282a36; /* Dracula background */
    color: #f8f8f2; /* Dracula foreground */
    padding: 1.5em;
    border-radius: 8px;
    margin: 2em 0;
    font-size: 1.1em;
    line-height: 1.8;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    overflow-x: auto;
}
.bit-op-vis .line {
    display: flex;
    align-items: center;
    margin-bottom: 0.75em;
}
.bit-op-vis .line:last-child {
    margin-bottom: 0;
}
.bit-op-vis .label {
    min-width: 120px;
    color: #8be9fd; /* Dracula cyan */
    text-align: right;
    padding-right: 1em;
}
.bit-op-vis .bits {
    display: flex;
}
.bit-op-vis .bit {
    width: 2.2ch;
    text-align: center;
}
.bit-op-vis .bit.highlight {
    color: #ffb86c; /* Dracula orange */
    font-weight: bold;
    transform: scale(1.1);
}
.bit-op-vis .separator {
    width: 2ch;
    text-align: center;
    color: #6272a4; /* Dracula comment */
}
.bit-op-vis .op-symbol {
    min-width: 120px;
    color: #ff79c6; /* Dracula pink */
    font-weight: bold;
    text-align: right;
    padding-right: 1em;
}
.bit-op-vis hr {
    border: none;
    border-top: 1px solid #6272a4; /* Dracula comment */
    margin: 1em 0;
}
.bit-op-vis .comment {
    color: #6272a4; /* Dracula comment */
    font-style: italic;
    margin-left: 2em;
}
.bit-op-vis .index-line .bit {
    color: #bd93f9; /* Dracula purple */
    font-size: 0.9em;
}
</style>

<div class="bit-op-vis">
  <div class="line">
    <span class="label">value =</span>
    <div class="bits">
      <span class="bit">1</span><span class="bit">0</span><span class="bit">1</span><span class="bit">0</span>
      <span class="separator">_</span>
      <span class="bit">1</span><span class="bit">1</span><span class="bit">0</span><span class="bit">1</span>
    </div>
    <span class="comment">// 0b1010_1101</span>
  </div>
</div>

and we want to check bit 3 (counting from the right, starting at 0):

<div class="bit-op-vis">
  <div class="line index-line">
    <span class="label">Bit index:</span>
    <div class="bits">
      <span class="bit">7</span><span class="bit">6</span><span class="bit">5</span><span class="bit">4</span>
      <span class="separator"> </span>
      <span class="bit">3</span><span class="bit">2</span><span class="bit">1</span><span class="bit">0</span>
    </div>
  </div>
  <div class="line">
    <span class="label">value:</span>
    <div class="bits">
      <span class="bit">1</span><span class="bit">0</span><span class="bit">1</span><span class="bit">0</span>
      <span class="separator"> </span>
      <span class="bit highlight">1</span><span class="bit">1</span><span class="bit">0</span><span class="bit">1</span>
    </div>
  </div>
</div>

To focus on bit 3, we create a mask with `1` only at that position:

<div class="bit-op-vis">
  <div class="line">
      <span class="label">mask =</span>
      <div class="bits">
          <span class="bit">0</span><span class="bit">0</span><span class="bit">0</span><span class="bit">0</span>
          <span class="separator">_</span>
          <span class="bit">1</span><span class="bit">0</span><span class="bit">0</span><span class="bit">0</span>
      </div>
      <span class="comment">// 1 &lt;&lt; 3, or 0b0000_1000</span>
  </div>
</div>

Here’s another concept from college. If we apply **AND operator** to this value and mask:

<div class="bit-op-vis">
  <div class="line">
    <span class="label">value</span>
    <div class="bits">
      <span class="bit">1</span><span class="bit">0</span><span class="bit">1</span><span class="bit">0</span><span class="separator">_</span><span class="bit highlight">1</span><span class="bit">1</span><span class="bit">0</span><span class="bit">1</span>
    </div>
  </div>
  <div class="line">
    <span class="op-symbol">&amp;</span>
    <div class="bits">
      <span class="bit">0</span><span class="bit">0</span><span class="bit">0</span><span class="bit">0</span><span class="separator">_</span><span class="bit highlight">1</span><span class="bit">0</span><span class="bit">0</span><span class="bit">0</span>
    </div>
    <span class="comment">// mask</span>
  </div>
  <hr>
  <div class="line">
    <span class="label">result</span>
    <div class="bits">
      <span class="bit">0</span><span class="bit">0</span><span class="bit">0</span><span class="bit">0</span><span class="separator">_</span><span class="bit highlight">1</span><span class="bit">0</span><span class="bit">0</span><span class="bit">0</span>
    </div>
    <span class="comment">// non-zero</span>
  </div>
</div>

We can check:
- If bit 3 is `1`, result is non-zero.
- If bit 3 is `0`, result is zero.

If the value had been, say:

<div class="bit-op-vis">
  <div class="line">
    <span class="label">value</span>
    <div class="bits">
      <span class="bit">1</span><span class="bit">0</span><span class="bit">1</span><span class="bit">0</span><span class="separator">_</span><span class="bit highlight">0</span><span class="bit">1</span><span class="bit">0</span><span class="bit">1</span>
    </div>
    <span class="comment">// 0b1010_0101</span>
  </div>
  <div class="line">
    <span class="op-symbol">&amp;</span>
    <div class="bits">
      <span class="bit">0</span><span class="bit">0</span><span class="bit">0</span><span class="bit">0</span><span class="separator">_</span><span class="bit highlight">1</span><span class="bit">0</span><span class="bit">0</span><span class="bit">0</span>
    </div>
    <span class="comment">// mask</span>
  </div>
  <hr>
  <div class="line">
    <span class="label">result</span>
    <div class="bits">
      <span class="bit">0</span><span class="bit">0</span><span class="bit">0</span><span class="bit">0</span><span class="separator">_</span><span class="bit highlight">0</span><span class="bit">0</span><span class="bit">0</span><span class="bit">0</span>
    </div>
    <span class="comment">// zero</span>
  </div>
</div>

From this, we can see that in the first value, bit 3 was 1 (result is non-zero), while in the second value, bit 3 was 0 (result is zero). This is great, because now we have a tool to check whether a bit is 0 or 1 in our arsenal.

Similarly, if we apply **OR operator** to this value and mask:

<div class="bit-op-vis">
  <div class="line">
    <span class="label">value</span>
    <div class="bits">
      <span class="bit">1</span><span class="bit">0</span><span class="bit">1</span><span class="bit">0</span><span class="separator">_</span><span class="bit highlight">0</span><span class="bit">1</span><span class="bit">0</span><span class="bit">1</span>
    </div>
    <span class="comment">// original had bit 3 as 0</span>
  </div>
  <div class="line">
    <span class="op-symbol">|</span>
    <div class="bits">
      <span class="bit">0</span><span class="bit">0</span><span class="bit">0</span><span class="bit">0</span><span class="separator">_</span><span class="bit highlight">1</span><span class="bit">0</span><span class="bit">0</span><span class="bit">0</span>
    </div>
    <span class="comment">// mask</span>
  </div>
  <hr>
  <div class="line">
    <span class="label">result</span>
    <div class="bits">
      <span class="bit">1</span><span class="bit">0</span><span class="bit">1</span><span class="bit">0</span><span class="separator">_</span><span class="bit highlight">1</span><span class="bit">1</span><span class="bit">0</span><span class="bit">1</span>
    </div>
    <span class="comment">// bit 3 is now 1</span>
  </div>
</div>

Proving that by applying the **OR operator**, we can always set a specific bit to 1, no matter what its previous value was.

Now, let us take another look at our get and set methods:

```rust
impl BitArray {
  ...
    pub fn set(&mut self, index: usize) -> Option<bool> {
        let lookup = self.peek(index)?;
        let mask = 1u64 << lookup.bit_offset;
        let byte = &mut self.bits[lookup.word_index];

        let previous = (*byte & mask) != 0;
        *byte |= mask;

        Some(previous)
    }

    pub fn get(&self, index: usize) -> Option<bool> {
        let lookup = self.peek(index)?;
        Some((self.bits[lookup.word_index] & 
        (1u64 << lookup.bit_offset)) != 0)
    }
}
```

As you can see, we start by calculating a mask, and one by one, for every bit we either apply **OR** or **AND** operators, for get and set, respectively.

We will introduce a final method to our bit array implementation:

```rust
impl BitArray {
  ...
    pub fn count_ones(&self) -> usize {
        self.bits
            .iter()
            .map(|word| word.count_ones() as usize)
            .sum()
    }
}
```

This method helps us count the bits that are set to 1 and will be useful for our bloom filter implementation. And voilà! We have a working bit array implementation in place.

## Hashes
Before we get into this, I should mention that we are **NOT** going to implement hash functions. I've done that before, they are very hard to reason about and not particularly fun to implement from scratch. Instead, we will rely on what Rust's standard library kindly provides for us.

As a rule of thumb, we want our hash functions to be as uniformly distributed as possible. In practice, this means that every bit in the array should be equally likely to be flipped. If certain regions of the bit array are favored over others, those bits will fill up quickly, and the Bloom Filter will start returning _maybe_ far more often than it should. The hash function should also be fast, since we’re going to run it many times.

We’ve already mentioned that we need **k** different hash functions for a Bloom Filter to work. At first glance, having **k** separate hash functions might seem inefficient. But since we’re smart (!) computer scientists, we have a few tricks up our sleeves. To be precise, we have 2:

### 1. (In lack of a better term) Seeded Hashing
This is straightforward. Let’s imagine the following function:

```rust
use std::hash::{DefaultHasher, Hash, Hasher};
...
pub fn generate<T: Hash>(item: &T, seed: u64) -> u64 {
    let mut hasher = DefaultHasher::new();
    seed.hash(&mut hasher);
    item.hash(&mut hasher);
    hasher.finish()
    }
```

Feeding different seeds into this function **k** times:

```rust
(0..k).map(|i| generate(item, i))
```

produces **k** different hash values while requiring only a single hash function. That saves the day, right? **Right**?

Even though this saves us from the burden of maintaining **k** different functions, we still have to call a hash function **k** times. As we explained earlier, all of these calls might cost too much. Luckily, we can do better:

### 2. Double Hashing
Our last attempt at producing a perfect hashing scheme was relatively successful: we found a way to generate **k** distinct hash values using only a single hash function. Now we will introduce another trick that allows us to use a single hash function with just two calls. This technique is called **double hashing**.

1. We need two different hash values: $h_1(x)$ and $h_2(x)$.
2. We will use the following formula to generate **k** other hash values:
$$
h_i(x) = \big(h_1(x) + i \cdot h_2(x)\big) \bmod m
$$

This way, we can have **k** distinct, pseudo-independent positions to insert into our bit array. We also made two calls to a hash function, saving time.

Also, notice **m** here? At the very start of this article, we defined it as such:

> **m** is the size of the bit array.

I am not going to delve into the theory behind this equation, but the [paper](https://eecs.harvard.edu/~michaelm/postscripts/rsa2008.pdf) behind it is very interesting and worthy a look.

However, there are a couple of properties $h_2(x)$ should satisfy:
1. It should never yield an index of zero. 
   - If $h_2(x) = 0$, then every $i > 0$ we will generate the same position as $h_1(x)$
   - This would break the double hashing principle, because all derived hashes would collide at the first position.
   - Therefore, $h_2(x)$ should always be ≥ 1.
2. It should cycle through the whole table
   - Think of the sequence of positions generated by $h_i(x) = \big(h_1(x) + i \cdot h_2(x)\big) \bmod m$
   - If $h_2$ shares a common factor with **m**, it might only hit a subset of positions. This means it will never uniformly cover the entire bit array.
   - To guarantee full coverage, $h_2(x)$ should be _relatively prime_ to **m**.

I know these pseudo-mathematical proofs might seem like unnecessary mumbo-jumbo for many of you, so let us translate this to hackerspeak:

1. **m** should ideally be a prime number.
  - If **m** is prime, any $h_2(x) \in [1, m-1]$ automatically works.
2. Make sure $h_2(x)$ returns a value between $1$ and $m - 1$ (never 0, never ≥ m).

After leaving all this behind, it is time to have some fun. Let's write some code.

Remember our generate function:

```rust
use std::hash::{DefaultHasher, Hash, Hasher};

pub fn generate<T: Hash>(item: &T, seed: u64) -> u64 {
    let mut hasher = DefaultHasher::new();
    seed.hash(&mut hasher);
    item.hash(&mut hasher);
    hasher.finish()
}
```

We are going to use this as our base and write an iterator:

```rust
pub fn iter<T: Hash>(item: &T, m: usize, k: usize) 
-> impl Iterator<Item = usize> + '_ {
    let first_hash = generate(&item, 0);
    let second_hash = generate(&item, 1);

    (0..k).map(move |idx| {
        let step = (idx as u64).wrapping_mul(second_hash);
        let pos = first_hash.wrapping_add(step);
        (pos % m as u64) as usize
    })
}
```

Let us unpack some concepts here, because Rust can be intimidating at times.

As you can see, this is a generic function that takes a type that implements `Hash` trait, meaning the value we accept should be hashable.

`impl Iterator<Item = usize>` defines an opaque type. We are telling the compiler that our function will return an implementation of `Iterator` trait where its items will be `usize` values. Our code will produce a `std::iter::Map<std::ops::Range<usize>, [closure]>`, and having this at our function declaration can be obtusely verbose.

`'_` here is a lifetime elision. Notice that we are borrowing `item: &T` here. As such, we have to tell the compiler that the lifetime of the iterator we are returning shall be tied to the data it is borrowing, in this case, `item`.

The rest of the code is pretty easy to reason about. We generate two distinct hashes, and then apply the formula defined earlier.

I should also mention that `wrapping_mul` and `wrapping_add` calls here can slightly alter our formula, since they allow integer overflow to wrap around at $2^64$ rather than computing exact mathematical modular arithmetic. But in a practical sense, they don't make _that_ much of a difference. You only live once, am I right or am I right?

And that's it! We now have all the necessary components. We can start implementing a bloom filter!

## Implementing set and get Methods for the Bloom Filter
Remember these letters I constantly write in bold? **k**, **m**, and **n**? Well, they are crucial for this whole ordeal. 

We are going to arrange them inside a configuration struct. So let us come up with a _Builder_ to construct one:

```rust
pub struct BloomFilterConfig {
    m: usize, // Number of bits in the bit array
    n: usize, // Expected number of inserted elements
    k: usize, // Number of hash functions
}

impl BloomFilterConfig {
    fn new(m: usize, n: usize, k: usize) -> Self {
        Self { m, n, k }
    }
}

const BLOOM_FILTER_DEFAULT_M: usize = 100;

const BLOOM_FILTER_DEFAULT_N: usize = 100;

const BLOOM_FILTER_DEFAULT_K: usize = 10;

pub struct BloomFilterConfigBuilder {
    m: Option<usize>,
    n: Option<usize>,
    k: Option<usize>,
}

impl BloomFilterConfigBuilder {
    pub fn new() -> Self {
        Self {
            m: None,
            n: None,
            k: None,
        }
    }

    pub fn m(mut self, m: usize) -> Self {
        self.m = Some(m);
        self
    }

    pub fn n(mut self, n: usize) -> Self {
        self.n = Some(n);
        self
    }

    pub fn k(mut self, k: usize) -> Self {
        self.k = Some(k);
        self
    }

    pub fn build(self) -> BloomFilterConfig {
        BloomFilterConfig {
            m: self.m.unwrap_or(BLOOM_FILTER_DEFAULT_M),
            n: self.n.unwrap_or(BLOOM_FILTER_DEFAULT_N),
            k: self.k.unwrap_or(BLOOM_FILTER_DEFAULT_K),
        }
    }
}

impl Default for BloomFilterConfigBuilder {
    fn default() -> Self {
        Self::new()
    }
}
```

We set **k**, **m** and **n**, and if they are not provided by the user, we fall back to the default values we defined in our code. 

Then, we define our data model:

```rust
pub struct BloomFilter {
    bit_array: BitArray,
    config: BloomFilterConfig,
}
```

and a constructor:

```rust
impl BloomFilter {
    pub fn new(config: BloomFilterConfig) -> Self {
        Self {
            bit_array: BitArray::new(config.m),
            config,
        }
    }
}
```

Let us also move our hash functions into a sealed module:
```rust
mod hash {
    use std::hash::{DefaultHasher, Hash, Hasher};

    pub fn generate<T: Hash>(item: &T, seed: u64) -> u64 {
        let mut hasher = DefaultHasher::new();
        seed.hash(&mut hasher);
        item.hash(&mut hasher);
        hasher.finish()
    }

    pub fn iter<T: Hash>(item: &T, m: usize, k: usize) 
    -> impl Iterator<Item = usize> + '_ {
        let first_hash = generate(&item, 0);
        let second_hash = generate(&item, 1);

        (0..k).map(move |idx| {
            let step = (idx as u64).wrapping_mul(second_hash);
            let pos = first_hash.wrapping_add(step);
            (pos % m as u64) as usize
        })
    }
}
```

I know this post may have felt a bit long, but from now on, things will move faster because we’ve built a solid foundation by covering the underlying concepts. 

Let us implement the set operation first:

```rust
impl BloomFilter {
  ...
    pub fn insert<T: Hash>(&mut self, item: &T) {
        for pos in hash::iter(item, self.config.m, self.config.k) {
            self.bit_array.set(pos);
        }
    }
}
```

It is extremely easy to grasp, isn't it? We just iterate over generated hashes, and mark them as `1` inside our bit array.

get operation is also pretty straightforward:

```rust
impl BloomFilter {
  ...
    pub fn contains<T: Hash>(&self, item: &T) -> bool {
        hash::iter(item, self.config.m, self.config.k)
            .all(|idx| self.bit_array.get(idx).unwrap_or(false))
    }
}
```

We check whether all k positions are set to 1. If even a single bit is 0, the item definitely isn't in the filter. So we return false.

That concludes a complete Bloom Filter implementation. But we have to talk about those weird letters some more.

## Determining k, m, and n
As you might remember from the last chapter, we have to define a configuration like this:

```rust
let config = BloomFilterConfigBuilder::new()
    .k(3)
    .m(1)
    .n(1)
    .build();
```

and create a bloom filter by calling the constructor:

```rust
let mut bloom_filter = BloomFilter::new(config);
```

But there are a couple of problems here.

First of all, we need to determine **k**, **m**, and **n**. To do so, we have to **think**. And as you might have personally know, computer people are usually lazy, and they detest thinking about anything.

Secondly, we would need to empirically verify that the variables we chose are indeed the most optimal, which can be very time-consuming.

Luckily, the original Bloom filter paper defined a way to initialize the most efficient bloom filter (that was more or less refined later). To do that, we have to define another variable for the desired false positive rate, which we will call **p**.

For a given desired false positive rate **p** with **n** elements:

$$
m = -\frac{n \ln p}{(\ln 2)^2}
\qquad\text{and}\qquad
k = \frac{m}{n}\ln 2
$$

We no longer need a _Builder_ anymore:

```rust
impl BloomFilter {
    pub fn new(config: BloomFilterConfig) -> Self {
        Self {
            bit_array: BitArray::new(config.m),
            config,
        }
    }

    pub fn from_false_positive_rate(n: usize, p: f64) -> BloomFilter {
        let m = (-(n as f64) * p.ln() / (2.0f64.ln().powi(2))).ceil() as usize;
        let k = ((m as f64 / n as f64) * 2.0f64.ln()).round() as usize;

        let config = BloomFilterConfig::new(m, n, k);
        Self::new(config)
    }
    ...
}
```

We can now use this function to derive the values for m and k. All we have to do is specify how many elements (**n**) we plan to insert and the maximum false positive rate (**p**) that the system can tolerate.

There is another formula to calculate theoretical false positive rate, assuming **n** items were inserted:

$$
\text{p} = \left(1 - e^{-\frac{kn}{m}}\right)^k
$$

which translates to Rust as:

```rust
pub fn theoretical_false_positive_rate(&self) -> f64 {
    let m = self.config.m as f64;
    let k = self.config.k as f64;
    let n = self.config.n as f64;
    
    let exponent = -(k * n) / m;
    (1.0 - exponent.exp()).powf(k)
}
```

Emphasize on _theoretical_. It assumes our hash functions are perfectly uniform, whereas the hash implementation we are using ([SipHash](https://en.wikipedia.org/wiki/SipHash)) generates pseudo-random values and can be non-uniform. Nevertheless, this approximation is useful for understanding how well the Bloom filter is performing and diagnosing potential deviations from the expected false positive rate.

We can also determine how full the filter is based on the number of set bits, by using Maximum Likelihood Estimation:

$$
n_{\text{actual}} = -\frac{m}{k} \ln\left(1 - \frac{s}{m}\right)
$$

In Rust:

```rust
pub fn capacity_utilization(&self) -> f64 {
    let m = self.config.m as f64;
    let k = self.config.k as f64;
    let set_bits = self.bit_array.count_ones() as f64;

    // Maximum Likelihood Estimation
    let n_actual = -(m / k) * (1.0 - (set_bits / m)).ln();

    // Actual items / Expected capacity
    n_actual / self.config.n as f64
}
```

This is extremely useful for a couple of reasons:

- We can prevent high false positive rates, by monitoring capacity utilization, we can see when our filter is getting close to being full and might start returning too many false positives.
- We can plan for scaling up our filter
- We can have a cool Grafana dashboard about it.

If you are interested in learning more about mathematics of bloom filters, please refer [here](https://www.eecs.harvard.edu/~michaelm/postscripts/im2005b.pdf). As I explained at the very start of this _essay_, this is not an academic survey. All I wanted was to make practice meet theory.

And hopefully I was successful in that, because this concludes everything I wanted to share about Bloom filters. Thanks for reading, and if you have anything to say, please feel free to leave a comment!
