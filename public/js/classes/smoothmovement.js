/**
 * Released under the terms of the CC0 1.0 Universal legal code:
 * http://creativecommons.org/publicdomain/zero/1.0/legalcode
 * _______________________________________________________________________________
 * 
 * Creates a SmoothMovement which produces integer position values
 * representing movement towards a target position, with a maximum acceleration
 * or deceleration of one distance unit per time unit squared.
 *
 * @author Stephen Morley - http://code.stephenmorley.org/ (Modified by Raoul van Rueschen)
 */

var general = general || {};

(function(undefined, window)
{
 "use strict";

/**
 * Smooth Movement.
 * Facilitates smooth movement effects.
 *
 * @param position The initial position - this optional parameter defaults to zero.
 * @param target The target position - this optional parameter defaults to the value of the position parameter.
 */

general.SmoothMovement = function(position, target)
{
 this.position = (position === undefined) ? 0 : position;
 this.target = (target === undefined) ? this.position : target;
 this.velocity = 0;
};

/**
 * Sets the current position and target to 0.
 */

general.SmoothMovement.prototype.reset = function()
{
 this.position = 0;
 this.target = 0;
};

/**
 * Updates the position an velocity for this SmoothMovement
 *
 * @return The new position.
 */

general.SmoothMovement.prototype.update = function()
{
 if(this.velocity < 0)
 {
  if(this.target > (this.position - this.velocity * (this.velocity - 1) / 2))
  {
   ++this.velocity;
  }
  else if(this.target <= (this.position - (this.velocity - 1) * (this.velocity - 2) / 2))
  {
   --this.velocity;
  }
 }
 else
 {
  if(this.target < (this.position + this.velocity * (this.velocity + 1) / 2))
  {
   --this.velocity;
  }
  else if(this.target >= (this.position + (this.velocity + 1) * (this.velocity + 2) / 2))
  {
   ++this.velocity;
  }
 }

 this.position += this.velocity;
 return this.position;
};

/**
 * @return True if this SmoothMovement has stopped and false otherwise.
 */

general.SmoothMovement.prototype.hasStopped = function()
{
 return (this.position === this.target && this.velocity === 0);
};

/** End of Strict-Mode-Encapsulation **/
}(undefined, window));




