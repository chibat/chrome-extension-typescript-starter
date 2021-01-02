
if [ ! -f public/icon128.png ]; then
  ICON=$(pwd)/resources/icon.svg
  echo "generating icons from ${ICON}"
  convert -density 128x128 -background none -resize 128x128 ${ICON} public/icon128.png
  convert -density 48x48 -background none -resize 48x48 ${ICON} public/icon48.png
  convert -density 16x16 -background none -resize 16x16 ${ICON} public/icon16.png
fi
