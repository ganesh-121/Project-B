// ai.js — Smart Recommendation & Comparison Engine for Sri Sarees

const AI = {
  WEIGHTS: { occasion: 0.40, color: 0.25, fabric: 0.20, price: 0.10, stock: 0.05 },

  COLOR_FAMILIES: {
    warm: ['red','orange','yellow','golden','pink','coral','maroon','rust','peach'],
    cool: ['blue','green','purple','violet','teal','indigo','cyan','turquoise'],
    neutral: ['beige','white','cream','grey','gray','black','brown'],
  },

  getColorFamily(color) {
    const c = (color || '').toLowerCase();
    for (const [family, cols] of Object.entries(this.COLOR_FAMILIES))
      if (cols.some(fc => c.includes(fc) || fc.includes(c))) return family;
    return 'neutral';
  },

  scoreOccasion(saree, occasion) {
    if (!occasion) return 0.5;
    return saree.occasion.toLowerCase() === occasion.toLowerCase() ? 1.0 : 0.0;
  },
  scoreColor(saree, color) {
    if (!color) return 0.5;
    const sc = saree.color.toLowerCase(), tc = color.toLowerCase();
    if (sc === tc) return 1.0;
    if (this.getColorFamily(sc) === this.getColorFamily(tc)) return 0.6;
    return 0.1;
  },
  scoreFabric(saree, fabric) {
    if (!fabric) return 0.5;
    return saree.fabric.toLowerCase() === fabric.toLowerCase() ? 1.0 : 0.0;
  },
  scorePriceRange(saree, priceRange) {
    if (!priceRange) return 0.5;
    const { min, max } = priceRange;
    const ep = saree.price * (1 - saree.discount / 100);
    if (ep >= min && ep <= max) return 1.0;
    const dist = ep < min ? (min - ep) / min : (ep - max) / max;
    return Math.max(0, 1 - dist);
  },

  recommend(filters = {}, limit = 6) {
    const { occasion, color, fabric, priceRange } = filters;
    return DB.getSarees()
      .filter(s => s.stock > 0)
      .map(s => ({
        ...s,
        aiScore: Math.round((
          this.WEIGHTS.occasion * this.scoreOccasion(s, occasion) +
          this.WEIGHTS.color    * this.scoreColor(s, color) +
          this.WEIGHTS.fabric   * this.scoreFabric(s, fabric) +
          this.WEIGHTS.price    * this.scorePriceRange(s, priceRange) +
          this.WEIGHTS.stock    * Math.min(s.stock / 10, 1)
        ) * 100)
      }))
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, limit);
  },

  findSimilar(sareeId, limit = 4) {
    const sarees = DB.getSarees();
    const target = sarees.find(s => s.id === sareeId);
    if (!target) return [];
    return sarees
      .filter(s => s.id !== sareeId && s.stock > 0)
      .map(s => {
        const tagOverlap = (target.tags || []).filter(t => (s.tags || []).includes(t)).length;
        const maxTags = Math.max((target.tags || []).length, (s.tags || []).length, 1);
        const score = (tagOverlap / maxTags) * 0.5
          + (s.occasion === target.occasion ? 0.3 : 0)
          + (s.fabric   === target.fabric   ? 0.2 : 0);
        return { ...s, aiScore: Math.round(score * 100) };
      })
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, limit);
  },

  compare(id1, id2) {
    const sarees = DB.getSarees();
    const a = sarees.find(s => s.id === id1);
    const b = sarees.find(s => s.id === id2);
    if (!a || !b) return null;
    const priceA = a.price * (1 - a.discount / 100);
    const priceB = b.price * (1 - b.discount / 100);
    return {
      sareeA: a, sareeB: b,
      winner: {
        price: priceA <= priceB ? a : b,
        discount: a.discount >= b.discount ? a : b,
        stock: a.stock >= b.stock ? a : b,
      },
      details: {
        priceA: Math.round(priceA), priceB: Math.round(priceB),
        savingsA: a.price - Math.round(priceA), savingsB: b.price - Math.round(priceB),
      }
    };
  }
};
