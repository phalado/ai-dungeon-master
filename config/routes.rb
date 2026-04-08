Rails.application.routes.draw do
  namespace :api do
    post "dungeon/act", to: "dungeon#act"
  end

  # Health check pro Render
  get "up" => "rails/health#show", as: :rails_health_check
end
