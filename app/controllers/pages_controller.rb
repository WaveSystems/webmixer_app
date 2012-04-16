class PagesController < ApplicationController
  before_filter :authenticate_user!, :except => :index
  def index
    if user_signed_in?
      redirect_to '/decks'
    end
  end
  
  def decks
  end
end
