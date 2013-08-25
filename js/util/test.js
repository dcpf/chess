/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/


function movePiece ($obj, moveUp, moveRight, moveDown, moveLeft, targetOffset) {
     var keepMoving = false;
     if (moveUp && $obj.offset().top > targetOffset.top) {
          $obj.offset({top: $obj.offset().top - moveUp});
          keepMoving = true;
     }
     if (moveRight && $obj.offset().left < targetOffset.left) {
          $obj.offset({left: $obj.offset().left + moveRight});
          keepMoving = true;
     }
     if (moveDown && $obj.offset().top < targetOffset.top) {
          $obj.offset({top: $obj.offset().top + moveDown});
          keepMoving = true;
     }
     if (moveLeft && $obj.offset().left > targetOffset.left) {
          $obj.offset({left: $obj.offset().left - moveLeft});
          keepMoving = true;
     }
     if (keepMoving) {
          setTimeout(function(){movePiece($obj, moveUp, moveRight, moveDown, moveLeft, targetOffset)}, 5);
     }
}

function doIt () {

     // get the piece and its orig offset
     var $img = $('#sq60').children('img');
     var origOffset = $img.offset();

     // blank out the square where it lives
     $('#sq60').html('');

     // Get a handle on the target square. If there is a piece there, get its offset. Else, put the piece we already have there, and get its new offset.
     var targetOffset;
     var $target = $('#sq57');
     var $img2 = $target.children('img');
     if ($img2[0]) {
          targetOffset = $img2.offset();
     } else {
          $target.html($img);
          targetOffset = $img.offset();
          // blank out the target square
          $target.html('');
     }

     // attach the img to the body and set its offset to the original offset
     $('body').append($img);
     $img.offset(origOffset);

     var goUp = (origOffset.top > targetOffset.top);
     var goDown = (origOffset.top < targetOffset.top);
     var goLeft = (origOffset.left > targetOffset.left);
     var goRight = (origOffset.left < targetOffset.left);

     var moveUp = 0, moveDown = 0, moveLeft = 0, moveRight = 0;
     if (goUp && goRight) {
          var distanceUp = origOffset.top - targetOffset.top;
          var distanceRight = targetOffset.left - origOffset.left;
          if (distanceUp > distanceRight) {
               moveUp = 1;
               moveRight = 1/(distanceUp/distanceRight);
          } else if (distanceUp < distanceRight) {
               moveRight = 1;
               moveUp = 1/(distanceRight/distanceUp);
          } else {
               moveUp = 1;
               moveRight = 1;
          }
     } else if (goUp && goLeft) {
          var distanceUp = origOffset.top - targetOffset.top;
          var distanceLeft = origOffset.left - targetOffset.left;
          if (distanceUp > distanceLeft) {
               moveUp = 1;
               moveLeft = 1/(distanceUp/distanceLeft);
          } else if (distanceUp < distanceLeft) {
               moveLeft = 1;
               moveUp = 1/(distanceLeft/distanceUp);
          } else {
               moveUp = 1;
               moveLeft = 1;
          }
     } else if (goDown && goRight) {
          var distanceDown = targetOffset.top - origOffset.top;
          var distanceRight = targetOffset.left - origOffset.left;
          if (distanceDown > distanceRight) {
               moveDown = 1;
               moveRight = 1/(distanceDown/distanceRight);
          } else if (distanceDown < distanceRight) {
               moveRight = 1;
               moveDown = 1/(distanceRight/distanceDown);
          } else {
               moveDown = 1;
               moveRight = 1;
          }
     } else if (goDown && goLeft) {
          var distanceDown = targetOffset.top - origOffset.top;
          var distanceLeft = origOffset.left - targetOffset.left;
          if (distanceDown > distanceLeft) {
               moveDown = 1;
               moveLeft = 1/(distanceDown/distanceRight);
          } else if (distanceDown < distanceLeft) {
               moveLeft = 1;
               moveDown = 1/(distanceLeft/distanceDown);
          } else {
               moveDown = 1;
               moveLeft = 1;
          }
     } else if (goUp) {
          moveUp = 1;
     } else if (goDown) {
          moveDown = 1;
     } else if (goRight) {
          moveRight = 1;
     } else if (goLeft) {
          moveLeft = 1;
     }
     console.log('moveUp: ' + moveUp + '; moveRight: ' + moveRight + '; moveDown: ' + moveDown + '; moveLeft: ' + moveLeft);
     movePiece($img, moveUp, moveRight, moveDown, moveLeft, targetOffset)
}
