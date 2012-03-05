class AddColumnsToProfile < ActiveRecord::Migration
  def up
    change_table(:profiles) do |t|
      t.has_attached_file :avatar
    end
  end
  def down
    drop_attached_file :profiles, :avatar
  end
end
