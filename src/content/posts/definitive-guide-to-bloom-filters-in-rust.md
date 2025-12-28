---
title: "The Definitive Guide to Bloom Filters (in Rust)"
description: "An in-depth exploration of key concepts behind Bloom Filters, with a complete implementation in Rust."
pubDate: 2025-12-27
tags: ["Rust", "Data Structures", "Bloom Filter"]
---
I read a Reddit post a while ago with a meme attached, making fun of people who had just learned about Arena's and Bloom Filters and tried to apply their new-found knowledge to everything. For what it's worth, if you have recently acquired a hammer, everything is a nail.

I know every programming language community has its own idea of what Arena's are, so it’s pointless to think of it as a single thing, but rather a concept of being totally zen. And maybe the real Arena's were the friends we made along the way.

But Bloom Filters are different. They have been an integral part of the Computer Science ethos long before I was born and have been applied to many problems that are worth solving. I used them in a plethora of languages, implemented them over and over again. So I was confident enough in my practical skills to implement one. Only after running `cargo new bloom_filter`, I realized I did not know what I was supposed to do without copy-pasting a bunch of formulas I didn’t understand onto my screen.

As such, we are going to demystify Bloom Filters in this post, focusing on _why_ they work, not just _how_ to implement them. I am not going to bore you by plagiarising the entire [Wikipedia article](https://en.wikipedia.org/wiki/Bloom_filter) but rather we will focus on explaining the theoretical aspects of the subject practically. We will also come up with a Rust implementation, because all the cool kids started coding with it recently.

## What is a Bloom Filter?
I am terrible with names. But I am really good with faces. I often spend time with someone and become good friends, only to learn their name weeks later. That being said, time flies and faces change; and every once in a while I encounter someone who I don't recognize at all. But I can easily tell when I have never seen someone’s face before.

A Bloom Filter works in a similar way. At its core, it answers a very specific question:

> Have I definitely not seen this face before?

Notice the phrasing. Like me, a Bloom Filter can confidently say if it has *never seen* a face before.

- If it says no, you can trust it completely. That face is new. 
- If it says yes, that's a maybe. It is hedging its bets. We’ve all had those embarrassing moments when we approach someone we think we know, only to realize it’s someone else.

There are countless ways to illustrate Bloom Filters: you could compare them to the guest list of a Berlin Techno Club, or to the past and future roster of Fenerbahçe SK. But instead of spinning more analogies, let’s see what they really are under the hood.

Formally, a Bloom Filter is a fixed-size array of bits. To insert an item, we run **k** different hash functions to map it to positions in the array and flip the corresponding bits to 1. Later, when we want to check if an item is already in the filter, we run the same **k** hash functions and look at those positions. If any of the bits are 0, we can confidently say the item is definitely new. If all the bits are 1, the item might already be in the filter; there’s a small chance of a false positive.

Here's some Javascript to better visualize the concepts:

<!-- JS-based script to render a Bloom Filter visualization -->
<div style="font-family:sans-serif; max-width:600px; margin:20px auto; padding:20px; border:1px solid #ddd; border-radius:12px; background:linear-gradient(to bottom, #f8f9fc, #ffffff); box-shadow:0 4px 12px rgba(0,0,0,0.1);">
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

Bloom Filters are fixed-size. We also have to specify two different constants: **n** and **m**.

- **n** is the number of items we anticipate being inserted. 
- **m** is the size of the bit array. The bigger the *m* is, the fewer false positives we will get.

Choosing these constants carefully is crucial for an optimal Bloom Filter. Too many hash functions can slow down execution, since each hash function is computationally costly. Meanwhile, a very large bit array can increase memory usage. Luckily, there’s a way to mathematically choose the optimal values. We'll cover this during the implementation phase.

## Bit Arrays
To have a functioning Bloom Filter, we need a bit array and a hash function implementation. Luckily, both are available within Rust ecosystem.

However, since the point of this exercise is to learn, we’ll implement our own bit array as well, like [real programmers](https://homepages.inf.ed.ac.uk/rni/papers/realprg.html) do. That way, we can also see how bitwise operations work.

We start with a simple struct, amptly named BitArray:

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
Notice the call to `div_ceil(64)` on our size. A bit array is just a bunch of bits stored together, and we organize them into 64-bit integers (u64) because that’s what the CPU likes to work with efficiently.

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

As you can see, we first divide by 64 to find the word index, then perform a modulo operation to find the exact place of the bit. Furthermore, since peek is always going to be in the hot path of our program, we tell the compiler to always [inline](https://nnethercote.github.io/perf-book/inlining.html) it. That way, we gain a slight performance boost.


We also perform an if-check to prevent possible overflows. Remember that our bit array is fixed in size, and attempting to insert more elements than it supports will cause all kinds of headaches.

Coming from a Scala background, I prefer concrete types in situations like this rather than using tuple fields. This allows us to name things explicitly, and when we revisit the code a year later we can clearly understand what we were thinking at the time. So let us refactor the code slightly:

```rust
#[derive(Copy, Clone)]
struct Lookup {
    byte_index: usize,
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
            byte_index: index / 64,
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
   
As such, our API is also designed to follow these guidelines.

And now let us implement get and set methods:

```rust
impl BitArray {
  ...
    pub fn set(&mut self, index: usize) -> Option<bool> {
        let lookup = self.peek(index)?;
        let mask = 1u64 << lookup.bit_offset;
        let byte = &mut self.bits[lookup.byte_index];

        let previous = (*byte & mask) != 0;
        *byte |= mask;

        Some(previous)
    }

    pub fn get(&self, index: usize) -> Option<bool> {
        let lookup = self.peek(index)?;
        Some((self.bits[lookup.byte_index] & 
        (1u64 << lookup.bit_offset)) != 0)
    }
}
```

Now, there is a lot to unpack here. To do that, we need to understand a simple Computer Science trick, called _masking_:

## Masking
