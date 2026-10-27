@echo off
echo ========================================================
echo   Deploying CMSys Projects to Firebase Hosting
echo ========================================================
echo.
echo Target Site: cmsys-projects-v2
echo Default URL: https://cmsys-projects-v2.web.app
echo Custom URL:  https://projects.cmsys.site
echo.
call npx firebase-tools deploy --only hosting:projects --project cmsys-v2
echo.
echo ========================================================
echo   Deployment complete!
echo ========================================================
echo Hosting URL:  https://cmsys-projects-v2.web.app
echo Custom URL:   https://projects.cmsys.site
echo.
pause
