class NonlinearFeatures
  def initialize(options = {})
    options = options.reverse_merge(
      powers: [0, 1],
      functions: [],
    )
    @powers = options[:powers]
    @functions = options[:functions]
    @grng = Distribution::Normal.rng
  end

  def generate(xx)
    pp = @powers.map{|e| e==0 ? xx.map{1} : xx.map{|x| x**e}}
    ff = @functions.map{|ff| nil }
    return Matrix.columns(pp)
  end

  def noisy_data(xx, coefs, noise)
    mm = xx.length
    noise = noise.to_f
    e = Matrix.column_vector(mm.times.map{@grng.call * noise})
    data = self.generate(xx)
    cols = data.t.to_a
    return data * Matrix.column_vector(coefs) + e
  end
end