---
theme: default
title: "How a CPU cache works"
fonts:
  sans: Plus Jakarta Sans
  mono: JetBrains Mono
  weights: "400,500,600,700,800"
  italic: false
aspectRatio: 16/9
canvasWidth: 1180
routerMode: hash
colorSchema: light
favicon: /logo.svg
layout: full
defaults:
  preload: false
monaco: false
record: false
browserExporter: false
contextMenu: false
drawings:
  enabled: false
hideFooter: true
---
<div class="ttl">
  <div class="l">
    <img class="logo" src="/logo.svg" alt="" />
    <div class="lec">Lecture 1</div>
    <h1>How a CPU<br /><span>cache works</span></h1>
    <p class="sub">Why reading the same data twice can be a hundred times faster the second time.</p>
    <div class="meta"><div><b>Your Name</b>Your role, your organisation</div></div>
  </div>
  <div class="r"><div class="grid"></div><TitleArt /></div>
</div>

<!--
Welcome. Today we look at the small, fast memory that sits next to every CPU core, and why it decides how fast most programs run. The picture on the right: data flowing from main memory into the cache and on to the core.
-->
---
layout: full
title: "Part 1"
---
<div class="sec">
  <div class="band">01</div>
  <div class="tx">
    <div class="p">Part 1</div>
    <h1>Where the data comes from</h1>
    <p>The path a value takes from main memory to the core, and how long each hop takes.</p>
    <div class="steps">
      <div class="on">Where the data comes from</div><div>Hits and misses</div><div>Writing code that uses the cache</div>
    </div>
  </div>
</div>

<!--
Part 1. Before we can talk about speed we need the path a value travels.
-->
---
layout: full
title: "The memory path"
clicks: 4
---
<div class="s">
  <div class="kick">the memory path</div>
  <h2 class="hd">Every value the core uses travels <em>from memory, through the cache</em></h2>
  <div class="fig"><FigPipeline /></div>
</div>

<!--
Walk left to right, one box per click. Main memory (RAM) holds everything, about 16 GB on a laptop, and one read takes about 100 nanoseconds. Click: the cache, a small memory on the CPU chip, a few megabytes, about 1 nanosecond per read. Click: the core, which does the arithmetic. Click: the dot shows a value travelling along the path. Click: the definition. A cache is a small, fast copy of recently used data, kept close to the core.
-->
---
layout: full
title: "Hits and misses"
clicks: 6
---
<div class="s" v-click-hide="2">
  <div class="kick teal">hits and misses</div>
  <h2 class="hd">A read is either a <em>hit</em> or a <em>miss</em></h2>
  <div class="stats" style="margin-top: 28px">
    <div v-click="1" class="stat teal"><b>~1 ns</b><span>a hit: the value is already in the cache</span></div>
    <div v-click="1" class="stat rose"><b>~100 ns</b><span>a miss: the value must come from main memory</span></div>
  </div>
</div>
<div class="s" v-click="2">
  <div class="kick amber">one miss, step by step</div>
  <h2 class="hd">On a miss, the value makes <em>the whole trip</em> from memory</h2>
  <div class="fig"><FigPipeline :off="2" /></div>
</div>

<!--
Two outcomes for every read, both shown on click 1. A hit costs about 1 nanosecond, a miss about 100: 100 times slower. Click: now the path again, built step by step with the figure from the previous slide; its four steps are clicks 3 to 6 of this slide.
-->
---
layout: full
title: "Today in one slide"
clicks: 3
---
<div class="s">
  <div class="kick">today in one slide</div>
  <h2 class="hd">Three ideas to <em>keep from today</em></h2>
  <div class="d-map">
    <div class="hdr"><span>The idea</span><span>The number</span><span>Why it matters</span></div>
    <div v-click="1" class="row"><span class="pb">Every value passes through the cache</span><b class="fx1 i">a few MB</b><i class="w i">Small, so it cannot hold everything</i></div>
    <div v-click="2" class="row"><span class="pb">A miss is far slower than a hit</span><b class="fx1 r">~100×</b><i class="w r">Misses dominate run time</i></div>
    <div v-click="3" class="row"><span class="pb">Neighbours come along on a miss</span><b class="fx1 t">64 bytes</b><i class="w t">Reading in order is fast</i></div>
  </div>
</div>

<!--
The three ideas, one per click.
-->
---
layout: full
title: "Next lecture"
clicks: 2
hideFooter: true
---
<div class="d-next">
  <div class="l">
    <div class="kick">next lecture</div>
    <div class="lec">Lecture 2</div>
    <h1>Cache-friendly<br /><span>code</span></h1>
    <div class="items">
      <div v-click="1"><b>Reading in order</b>Why walking an array row by row beats column by column.</div>
      <div v-click="2"><b>Measuring misses</b>How to count cache misses on your own machine.</div>
    </div>
  </div>
  <div class="r"><div class="grid"></div><div class="art"><TitleArt /></div></div>
</div>

<!--
Point forward to the next lecture, one item per click.
-->
