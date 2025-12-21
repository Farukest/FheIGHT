/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const CONFIG = require('app/common/config');
const Card = require('app/sdk/cards/card');
const CardType = require('app/sdk/cards/cardType');
const Modifier = require('app/sdk/modifiers/modifier');
const ModifierDestructible = require('app/sdk/modifiers/modifierDestructible');
const UtilsGameSession = require('app/common/utils/utils_game_session');
const _ = require('underscore');

class Artifact extends Card {
  static initClass() {
  
    this.prototype.type = CardType.Artifact;
    this.type = CardType.Artifact;
    this.prototype.name = "Artifact";
  
    this.prototype.targetModifiersContextObjects = null; // just like entity modifier options, but used to create modifiers that are added to target of artifact
    this.prototype.durability = CONFIG.MAX_ARTIFACT_DURABILITY; // modifiers durability
    this.prototype.canBeAppliedAnywhere = true;
  }

  getPrivateDefaults(gameSession) {
    const p = super.getPrivateDefaults(gameSession);

    p.keywordClassesToInclude.push(ModifierDestructible);

    return p;
  }

  // region ### GETTERS / SETTERS ###

  setTargetModifiersContextObjects(targetModifiersContextObjects) {
    return this.targetModifiersContextObjects = targetModifiersContextObjects;
  }

  getTargetModifiersContextObjects() {
    return this.targetModifiersContextObjects;
  }

  // region ### GETTERS / SETTERS ###

  // region ### APPLY ###

  onApplyToBoard(board,x,y,sourceAction) {
    super.onApplyToBoard(board,x,y,sourceAction);

    if (this.getGameSession().getIsRunningAsAuthoritative() && (this.targetModifiersContextObjects != null)) {

      // find all artifacts on the General
      const general = this.getGameSession().getGeneralForPlayerId(this.getOwnerId());
      const modifiersByArtifact = general.getArtifactModifiersGroupedByArtifactCard();

      if (modifiersByArtifact.length >= CONFIG.MAX_ARTIFACTS) { // if there are already max number of artifacts on the General
        const artifactModifiers = modifiersByArtifact.shift(); // get all modifiers attached to the oldest artifact
        for (var modifier of Array.from(artifactModifiers)) {
          this.getGameSession().removeModifier(modifier);
        }  // and remove them
      }

      // add new artifact
      return (() => {
        const result = [];
        for (var modifierContextObject of Array.from(this.targetModifiersContextObjects)) {
        // artifact modifiers are not visible to the UI
          modifierContextObject.isHiddenToUI = true;

          // artifact modifiers are not removable by normal methods
          modifierContextObject.isRemovable = false;

          // artifact modifiers are removed when their durability reaches 0
          modifierContextObject.maxDurability = this.durability;
          modifierContextObject.durability = this.durability;

          // apply modifier
          result.push(this.getGameSession().applyModifierContextObject(modifierContextObject, general));
        }
        return result;
      })();
    }
  }
}
Artifact.initClass();

  // endregion ### APPLY ###

module.exports = Artifact;
