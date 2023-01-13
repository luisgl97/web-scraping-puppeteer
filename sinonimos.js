function closestMatch(target, alternatives) {
    let closest = alternatives[0];
    let closestDistance = levenshteinDistance(target, closest);
    for (let i = 1; i < alternatives.length; i++) {
      const distance = levenshteinDistance(target, alternatives[i]);
      if (distance < closestDistance) {
        closest = alternatives[i];
        closestDistance = distance;
      }
    }
    return closest;
  }
  
  function levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
  
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
  
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, 
                                  Math.min(matrix[i][j - 1] + 1, 
                                           matrix[i - 1][j] + 1));
        }
      }
    }
  
    return matrix[b.length][a.length];
  }
  
  const target = "ryzen 5 3600";
  const alternatives = ["ryzen 5 3600", "ryzen 5 3600x", "ryzen 5 3600G", "ryzen 5 1600", "ryzen 9 5900x", "ryzen5 36000x"];
  console.log(closestMatch(target, alternatives));
  // Output: "ryzen 5 3600"