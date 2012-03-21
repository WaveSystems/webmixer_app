WebmixerApp::Application.routes.draw do
  devise_for :users

  root :to => 'pages#index'
  get '/dashboard' => 'player#dashboard'
end
