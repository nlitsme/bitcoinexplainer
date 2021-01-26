function runtests()
{
    CHECK("start");
    CHECK("GCD(123, 996)", GCD(123, 996), [3, 81, -10]);
    CHECK("GCD(126, 996)", GCD(126, 996), [6, -79, 10]);
    CHECK("GCD(996, 126)", GCD(996, 126), [6, 10, -79]);
    CHECK("GCD(996, 1)", GCD(996, 1), [1, 0, 1]);
    CHECK("GCD(13, 17)", GCD(13, 17), [1, 4, -3]);

    CHECK("gcd(996, 126)", gcd(996, 126), 6);
    CHECK("lcm(996, 126)", lcm(996, 126), 20916);
    CHECK("modinv(111,997)==503", modinv(111, 997), 503);
    CHECK("numshr(111)==[1,55]", numshr(111), [1,55]);
    CHECK("numshr(110)==[0,55]", numshr(110), [0,55]);
    CHECK("numzero(110)==0", numzero(110), 0);
    CHECK("numzero(110n)==0n", numzero(110n), 0n);
    CHECK("modexp(123,2,997)==174", modexp(123,2,997), 174); 
    CHECK("modexp(123,900,997)==192", modexp(123,900,997), 192); 

    var F = new GaloisField(997);
    CHECK("123+123==246", F.value(123).add(F.value(123)), F.value(246));
    CHECK("100+900==3", F.value(100).add(F.value(900)), F.value(3));
    CHECK("100*2==200", F.value(100).mul(F.value(2)), F.value(200));
    CHECK("100*2==200", F.value(100).mul(2), F.value(200));
    CHECK("900*2==803", F.value(900).mul(2), F.value(803));

    CHECK("100*900==270", F.value(100).mul(F.value(900)), F.value(270));

    CHECK("123^900==192", F.value(123).pow(F.value(900)), F.value(192));
    CHECK("111^2==357", F.value(111).pow(F.value(2)), F.value(357));
    CHECK("111/222==499", F.value(111).div(F.value(222)), F.value(499));
    CHECK("222*499==111", F.value(222).mul(F.value(499)), F.value(111));

    // 997%8==5, %9==7
    // case where res==1
    CHECK("(.5) 860.sqrt(0)==94", F.value(860).sqrt(0), F.value(94));
    CHECK("(.5) 860.sqrt(1)==903", F.value(860).sqrt(1), F.value(903));
    // case where res!=1
    CHECK("(.5) 555.sqrt(0)==620", F.value(555).sqrt(0), F.value(620));
    CHECK("(.5) 555.sqrt(1)==377", F.value(555).sqrt(1), F.value(377));

    CHECK("(.7) 111.cubert(0)==749", F.value(111).cubert(0), F.value(749));
    CHECK("(.7) 111.cubert(1)==380", F.value(111).cubert(1), F.value(380));
    CHECK("(.7) 111.cubert(2)==865", F.value(111).cubert(2), F.value(865));

    var F = new GaloisField(977); // %8 ==1
    CHECK("(.1) 111.sqrt(0)==452", F.value(111).sqrt(0), F.value(452));
    CHECK("(.1) 111.sqrt(1)==525", F.value(111).sqrt(1), F.value(525));
    //CHECK("(.1) 111.cubert(0)==840", F.value(111).cubert(0), F.value(840));

    var F = new GaloisField(971);  // %8==3  %3==2
    CHECK("(.3) 111.sqrt(0)==800", F.value(111).sqrt(0), F.value(800));
    CHECK("(.3) 111.sqrt(1)==171", F.value(111).sqrt(1), F.value(171));
    CHECK("(.2) 111.cubert(0)==349", F.value(111).cubert(0), F.value(349));

    var F = new GaloisField(991);  // %8==7 %27==19
    CHECK("(.7) 111.sqrt(0)==280", F.value(111).sqrt(0), F.value(280));
    CHECK("(.7) 111.sqrt(1)==711", F.value(111).sqrt(1), F.value(711));
    CHECK("(.19) 111.cubert(0)==770", F.value(111).cubert(0), F.value(770));
    CHECK("(.19) 111.cubert(1)==793", F.value(111).cubert(1), F.value(793));
    CHECK("(.19) 111.cubert(2)==419", F.value(111).cubert(2), F.value(419));

    var F = new GaloisField(947);
    console.log(F.p, F.value(274).square(), F.value(673).square(), F.value(275).square());
    CHECK("(.x) 263.sqrt(0)==274", F.value(263).sqrt(0), F.value(274));
    CHECK("(.x) 263.sqrt(1)==673", F.value(263).sqrt(1), F.value(673));
    CHECK("(.x) 684.sqrt(0)==undef", F.value(684).sqrt(0)==undefined);

    var F = new GaloisField(967);
    CHECK("(.4) 118.cubert(0)==877", F.value(118).cubert(0), F.value(877));
    CHECK("(.4) 118.cubert(1)==758", F.value(118).cubert(1), F.value(758));
    CHECK("(.4) 118.cubert(2)==299", F.value(118).cubert(2), F.value(299));

    var F = new GaloisField(739);
    CHECK("(.10) 129.cubert(0)==719", F.value(129).cubert(0), F.value(719));
    CHECK("(.10) 129.cubert(1)==251", F.value(129).cubert(1), F.value(251));
    CHECK("(.10) 129.cubert(2)==508", F.value(129).cubert(2), F.value(508));

    // ec tests
    var F = new GaloisField(997);
    var E = new EllipticCurve(F, 0, 7);

    CHECK("(131,94).ispt", E.point(131, 94).isoncurve());
    CHECK("!(131,94).isinf", !E.point(131, 94).isinf());
    CHECK("inf.ispt", E.infinity().isoncurve());
    CHECK("inf.isinf", E.infinity().isinf());
    CHECK("!(131,93).ispt", !E.point(131 , 93).isoncurve());
    CHECK("(131,94)==(131,94)", E.point(131 , 94), E.point(131 , 94));
    CHECK("-(131,94)==(131,-94)", E.point(131 , 94).neg(), E.point(131, -94));
    CHECK("-(131,94)+(131,94) isinf", E.point(131 , 94).neg().add(E.point(131, 94)).isinf());
    CHECK("-(131,94)+(131,94) == inf", E.point(131 , 94).neg().add(E.point(131, 94)), E.infinity());
    CHECK("-(131,94)==(131,903)", E.point(131 , 94).neg(), E.point(131, 997-94));
    CHECK("(131,94)*2==(630,721)", E.point(131 , 94).mul(2), E.point(630, 721));
    CHECK("(131,94)+(131,94)==(630,721)", E.point(131 , 94).add(E.point(131 , 94)), E.point(630, 721));
    CHECK("(131,94)+(77,393)==(368,609)", E.point(131 , 94).add(E.point(77, 393)), E.point(368, 609));

    var F = new GaloisField(997n);
    CHECK("100n+900n==3n", F.value(100n).add(F.value(900n)), F.value(3n));
    CHECK("(.5) 860n.sqrt(0)==94n", F.value(860n).sqrt(0), F.value(94n));
    // case where res!=1
    CHECK("(.5) 555n.sqrt(1)==377n", F.value(555n).sqrt(1), F.value(377n));
    CHECK("(.7) 111n.cubert(0)==749n", F.value(111n).cubert(0), F.value(749n));


    var E = new EllipticCurve(F, 0n, 7n);
    CHECK("(131n,94n)*2n==(630n,721n)", E.point(131n , 94n).mul(2n), E.point(630n, 721n));

    CHECK("done");

    STATS();
}
