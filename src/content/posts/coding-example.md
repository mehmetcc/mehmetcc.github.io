---
title: "Code Highlighting Example"
pubDate: 2025-12-24
description: "Example snippets for Haskell, Rust, Java, and Python to demonstrate syntax highlighting."
---

Below are short examples for Haskell, Rust, Java and Python to demonstrate code fences and syntax highlighting.

```haskell
-- Haskell: factorial
factorial :: Integer -> Integer
factorial 0 = 1
factorial n = n * factorial (n - 1)
```

```rust
// Rust: simple ownership example
fn main() {
    let s = String::from("hello");
    takes_ownership(s);
    // s is no longer valid here
}

fn takes_ownership(some_string: String) {
    println!("{}", some_string);
}
```

```java
// Java: minimal class
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}
```

```python
# Python: list comprehension
squares = [x * x for x in range(10)]
print(squares)
```
