FF_RELS = 3.0 3.5 3.6
BF_VER = 0.5.5
MIN_VER = 3.0
MAX_VER = 3.6.*

all: componentcheck xpi nixball

help:
	@echo "Targets:"
	@echo " xpcom\t\tbuild binaries for this platform"
	@echo " dir\t\tbuild extension directories"
	@echo " xpi\t\tbuild xpi from extension folders"
	@echo " nixdir\t\tbuild nix source folder"
	@echo " nixball\tbuild nix source tarball"
	@echo " all\t\tbuild xpcom, xpi and tarball"
	@echo " clean\t\tremove all files generated by make"
	@echo " help\t\tthis text"

xpcom:
	make -C src FF_RELS="$(FF_RELS)"

dir: xpcom
	echo Creating extension folders
	mkdir -p scratch && cp -r ext/* scratch
	perl -pi -e "s/%%MINVER%%/$(MIN_VER)/g" scratch/install.rdf
	perl -pi -e "s/%%MAXVER%%/$(MAX_VER)/g" scratch/install.rdf
	perl -pi -e "s/%%VER%%/$(BF_VER)/g" scratch/install.rdf
	cp src/$(MIN_VER)/*.xpt src/*.js scratch/components
	@for release in $(FF_RELS); do \
        mkdir -p scratch/lib/$$release && \
        cp src/$$release/*.dll scratch/lib/$$release 2>/dev/null|| echo "*.dll for FF$$release missing" && \
        cp src/$$release/*-universal.dylib scratch/lib/$$release 2>/dev/null|| echo "*-universal.dylib for FF$$release missing"; \
    done

xpi: dir
	cd scratch && zip -r ../bonjourfoxy-$(BF_VER).xpi *

nixdir:
	echo Creating nix dir
	mkdir -p nix/bonjourfoxy-${BF_VER}/{ext,src}
	cp -r ext/ nix/bonjourfoxy-${BF_VER}/ext/
	perl -pi -e "s/%%VER%%/$(BF_VER)/g" nix/bonjourfoxy-${BF_VER}/ext/install.rdf
	cp src/*.{h,cpp,idl,js,html} nix/bonjourfoxy-${BF_VER}/src/
	cp src/Makefile.nix nix/bonjourfoxy-${BF_VER}/Makefile

nixball: nixdir
	env COPY_EXTENDED_ATTRIBUTES_DISABLE=true COPYFILE_DISABLE=true \
    tar -cvzf bonjourfoxy-$(BF_VER).tar.gz -C nix bonjourfoxy-${BF_VER}

componentcheck: xpcom
	@for release in $(FF_RELS); do \
        @for component in BFDNSSDService-darwin-universal.dylib BFDNSSDService.dll; do \
            if [ ! -f src/$$release/$$component ]; then \
                echo \ ; echo \*\* Please build src/$$release/$$component. Build will continue once it is built. \*\*; \
                while [ ! -f src/$$release/$$component ]; do sleep 2; done \
            fi; \
        done \
    done

clean:
	make -C src FF_RELS="$(FF_RELS)" clean
	rm -fr scratch/ nix/