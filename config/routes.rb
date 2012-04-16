WebmixerApp::Application.routes.draw do
  devise_for :users

  root :to => 'pages#index'
  get '/decks' => 'pages#decks'
end
