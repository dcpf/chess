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
          setTimeout(function(){movePiece($obj, moveUp, moveRight, moveDown, moveLeft, targetOffset)}, 10);
     }
}

function doIt () {
var $img = $('#sq60').children('img');
var origOffset = $img.offset();
$('#sq60').html('');
$('body').append($img);
$img.offset(origOffset);
var $target = $('#sq67');
var targetOffset = $target.offset();
targetOffset.top += 4;
targetOffset.left += 4;
//$img.offset(targetOffset);
var goUp = (origOffset.top > targetOffset.top);
var goDown = (origOffset.top < targetOffset.top);
var goLeft = (origOffset.left > targetOffset.left);
var goRight = (origOffset.left < targetOffset.left);

var moveUp = 0, moveDown = 0, moveLeft = 0, moveRight = 0;
if (goUp && goRight) {
     var distanceUp = origOffset.top - targetOffset.top;
     var distanceRight = targetOffset.left - origOffset.left;
     if (distanceUp > distanceRight) {
          moveUp = distanceUp/distanceRight;
          moveRight = 1;
     } else if (distanceUp < distanceRight) {
          moveRight = distanceRight/distanceUp;
          moveUp = 1;
     } else {
          moveUp = 1;
          moveRight = 1;
     }
} else if (goUp && goLeft) {
     var distanceUp = origOffset.top - targetOffset.top;
     var distanceLeft = origOffset.left - targetOffset.left;
     if (distanceUp > distanceLeft) {
          moveUp = distanceUp/distanceLeft;
          moveLeft = 1;
     } else if (distanceUp < distanceLeft) {
          moveLeft = distanceLeft/distanceUp;
          moveUp = 1;
     } else {
          moveUp = 1;
          moveLeft = 1;
     }
} else if (goDown && goRight) {
     var distanceDown = targetOffset.top - origOffset.top;
     var distanceRight = targetOffset.left - origOffset.left;
     if (distanceDown > distanceRight) {
          moveDown = distanceDown/distanceRight;
          moveRight = 1;
     } else if (distanceDown < distanceRight) {
          moveRight = distanceRight/distanceDown;
          moveDown = 1;
     } else {
          moveDown = 1;
          moveRight = 1;
     }
} else if (goDown && goLeft) {
     var distanceDown = targetOffset.top - origOffset.top;
     var distanceLeft = origOffset.left - targetOffset.left;
     if (distanceDown > distanceLeft) {
          moveDown = distanceDown/distanceRight;
          moveLeft = 1;
     } else if (distanceDown < distanceLeft) {
          moveLeft = distanceLeft/distanceDown;
          moveDown = 1;
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
