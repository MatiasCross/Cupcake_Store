<script>
  // Pure presentation: colours in, SVG out.
  export let cake = '#4a2c1a';
  export let frosting = '#6b3a22';
  export let filling = '#00000000';
  export let topping = '#00000000';
  export let shape = 'none';
  export let size = 140;

  const sprinkles = [[44,30,20],[60,24,-30],[76,32,55],[52,40,-60],[70,43,15],[60,12,80]];
  const chips = [[48,34],[66,28],[76,40],[56,44],[60,16]];
</script>

<svg width={size} height={size * 1.15} viewBox="0 0 120 138" role="img" aria-label="Cupcake">
  <!-- liner -->
  <path d="M24 72 L96 72 L88 128 Q60 135 32 128 Z" fill="#b98a5e" />
  {#each [38, 49, 60, 71, 82] as x}
    <path d={`M${x} 74 L${x < 60 ? x + 2 : x - 2} 130`} stroke="#8d6440" stroke-width="2" opacity=".5" />
  {/each}
  <!-- cake -->
  <path d="M20 74 Q18 48 60 48 Q102 48 100 74 Z" fill={cake} />
  <!-- filling ribbon -->
  <rect x="21" y="68" width="78" height="5" rx="2.5" fill={filling} />
  <!-- frosting swirl -->
  <ellipse cx="60" cy="46" rx="36" ry="12" fill={frosting} />
  <ellipse cx="60" cy="34" rx="27" ry="11" fill={frosting} />
  <ellipse cx="60" cy="23" rx="17" ry="10" fill={frosting} />
  <path d="M32 44 Q60 54 88 44 M40 32 Q60 41 80 32 M49 22 Q60 29 71 22" stroke="#000" stroke-opacity=".14" stroke-width="2" fill="none" />
  <ellipse cx="50" cy="20" rx="5" ry="3" fill="#fff" opacity=".28" />
  <!-- topping -->
  {#if shape === 'cherry'}
    <path d="M60 14 Q64 4 72 2" stroke="#3b5d2a" stroke-width="2" fill="none" />
    <circle cx="60" cy="14" r="7.5" fill={topping} />
    <circle cx="57.5" cy="11.5" r="2" fill="#fff" opacity=".6" />
  {:else if shape === 'sprinkles'}
    {#each sprinkles as [x, y, r], i}
      <rect x={x - 4} y={y - 1} width="8" height="2.6" rx="1.3" transform={`rotate(${r} ${x} ${y})`}
            fill={['#ff7aa8', '#ffd24d', '#6ac6ff', '#9be37a', topping, '#fff'][i % 6]} />
    {/each}
  {:else if shape === 'chips'}
    {#each chips as [x, y]}
      <path d={`M${x} ${y - 4} L${x + 4} ${y + 3} L${x - 4} ${y + 3} Z`} fill={topping} />
    {/each}
  {/if}
</svg>
