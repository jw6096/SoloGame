class Scene_Battle < Scene_Base
  attr_accessor :log_window
end

def manual_make_damage_value(value, subject, item)
    value *= item_element_rate(subject, item)
    value *= mdr
    value = apply_critical(value) if @result.critical
    value = apply_variance(value, item.damage.variance)
    value = apply_guard(value)
    @result.make_damage(value.to_i, item)
  end
  
  def custom_formula_lightningjump(a, b)
    log_window = SceneManager.scene.log_window
    targets = a.current_action.opponents_unit.alive_members
    targets.delete(b)
    if targets.length > 3
      targets = targets.shuffle.take(3)
    end
    targets.unshift(b)
    item = a.current_action.item
    targets.each_with_index { |target, index|
      standard_formula = 200 + a.mat * 2 - target.mdf * 2
      target.result.clear
      target.result.used = item_test(a, item)
      target.result.missed = (target.result.used && rand >= item_hit(a, item))
      target.result.evaded = (!target.result.missed && rand < item_eva(a, item))
      if target.result.hit?
        unless item.damage.none?
          target.result.critical = (rand < item_cri(a, item))
          value = standard_formula - (0.25 * standard_formula * index)
          target.manual_make_damage_value(value, a, item)
          target.execute_damage(a)
          log_window.clear
          log_window.add_text("The lightning jumps!")
          log_window.display_action_results(target, item)
        end
      end
    }
    b.result.clear
    return 0
  end
  
  def custom_formula_fireblast(a, b)
    log_window = SceneManager.scene.log_window
    targets = a.current_action.opponents_unit.alive_members
    targets.delete(b)
    targets.unshift(b)
    item = a.current_action.item
    targets.each_with_index { |target, index|
      standard_formula = 100 + a.mat - target.mdf
      target.result.clear
      target.result.used = item_test(a, item)
      target.result.missed = (target.result.used && rand >= item_hit(a, item))
      target.result.evaded = (!target.result.missed && rand < item_eva(a, item))
      if target.result.hit?
        unless item.damage.none?
          target.result.critical = (rand < item_cri(a, item))
          if index == 0
            value = standard_formula
          else
            value = standard_formula * 0.3
          end
          target.manual_make_damage_value(value, a, item)
          target.execute_damage(a)
          log_window.clear
          log_window.add_text("The fire spreads!")
          log_window.display_action_results(target, item)
        end
      end
    }
    b.result.clear
    return 0
  end
  
  def custom_formula_paladinstrike(a, b)
    log_window = SceneManager.scene.log_window
    standard_formula = a.atk * 4 - b.def * 2
    item = a.current_action.item
    b.result.clear
    b.result.used = item_test(a, item)
    b.result.missed = (b.result.used && rand >= item_hit(a, item))
    b.result.evaded = (!b.result.missed && rand < item_eva(a, item))
    if b.result.hit?
      unless item.damage.none?
        b.result.critical = (rand < item_cri(a, item))
        b.manual_make_damage_value(standard_formula, a, item)
        damage = b.result.hp_damage
        b.execute_damage(a)
        log_window.display_action_results(b, item)
      end
    end
    targets = a.current_action.friends_unit.alive_members
    targets.delete_if { |target| target.hp == target.mhp }
    if targets.length > 0
      lowest = targets[0]
      targets.each { |target| p "#{target.name} #{target.hp}"; lowest = target if target.hp < lowest.hp }
      lowest.manual_make_damage_value(-damage * 0.4, a, item)
      lowest.execute_damage(a)
      log_window.clear
      log_window.add_text(sprintf("%s is healed by the strike!", lowest.name))
      log_window.display_action_results(lowest, item)
    end
    b.result.clear
    return 0
  end