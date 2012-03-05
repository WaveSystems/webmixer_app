class CreateProfiles < ActiveRecord::Migration
  def change
    create_table :profiles do |t|
      t.string :bio
      t.date :birth_date
      t.string :tags
      t.timestamps
    end
  end
end
