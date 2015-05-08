class LinearModeler

  def initialize(options = {})
    options = options.reverse_merge(
      cost_function: :mse,
    )
#    @num_features > 0 or raise "Must have at least 1 feature"
    @cost_function = options[:cost_function]
  end

  # produce parameter estimates given data and truth outcomes
  def estimate(data, truth)
    if @cost_function == :mse
      llmse(data, truth)
    else
      raise "NIY"
    end
  end

  private

  # produce linear least squares estimator from NMatrix data
  def llmse(data, truth)
    mm = data.row_size
    truth.row_size == mm or raise "training data size mismatch"
    return (data.t * data).inv * data.t * truth
  end


end